/*************************************
//
// joola-challenge app
// author: Daniel Kopitchinski
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var device  = require('express-device');
var mongodb = require('mongodb');
var assert = require('assert');
var async = require('async');
var scheduler = require('node-schedule');

var url = 'mongodb://localhost:27017/viewslog';
var MongoClient = mongodb.MongoClient;
var viewlogsdb = null;
var viewlogsCollection = null;

//connect to db
MongoClient.connect(url, function(err ,db)
{
    assert.equal(null, err, "unable to connect to database");
    console.log("Connected correctly to server");
    viewlogsdb = db;
    viewlogsCollection = viewlogsdb.collection('viewlogs');
    assert(viewlogsCollection);
    //speed up db queryings by indexing "time" field.
    viewlogsCollection.ensureIndex({"time" : 1}, function(error, indexname)
    {
        assert.equal(null, error, "Unable to set up indexing for time field");
    });
});

//setup express
var runningPortNumber = process.env.PORT;

app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});


// logs every request
app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});
	// goes onto the next function in line
	next();
});

app.get("/", function(req, res){
    var remoteip = req.connection.remoteAddress;
    //log new view request
    viewlogsCollection.insert({'time' : new Date(), 'remoteip' : remoteip}, function(){});
	res.render('index', {});
    // update all clients.
    SendViewCountToClients();
});

server.listen(runningPortNumber);

io.sockets.on('connection', function (socket) {
    console.log("new connection");
    //update every new connection with the viewcount.
    //slightly inefficient - we end up querying the DB twice for every new connection
    //the alternative is to send new view counts only after a page has not only been loaded, but the socket has been established as well
    //the challenge requirements however were to log page views, not socket connections.
    SendViewCountToClients(socket);
});

var SendViewCountToClients = function(clientsocket)
{
    var hoursOfHistory = 24;
    var millisecondsInHour = 60*60*1000;
    var now = new Date();
    //Start 23-24 hours ago (rounded down)
    var firstMs = (Math.floor(now.getTime() / millisecondsInHour) - hoursOfHistory + 1) * millisecondsInHour;

    //Setup 24 different timestamp ranges. we'll query the database with these.
    //TBD: is it more efficient to query the DB all at once (24 hour range), and then count per hour in server?
    var timeRanges = new Array(hoursOfHistory);
    for(var x = 0; x < hoursOfHistory; x++)
        timeRanges[x] = {start: new Date(firstMs + x * millisecondsInHour), end: new Date(firstMs + (x+1) * millisecondsInHour)};

    var viewcountdata =
    {
        labels: timeRanges.map(
            function (x) {
                var start = x.start.getHours();
                var end = x.end.getHours();
                return ("0" + start + ":00").substr(-5) + "-" + ("0" + end + ":00").substr(-5);
            }),
        viewcounts: []
    };
    var sendViewCountsToClients = function(error, result)
    {
        assert.equal(null, error);
        assert(result);
        assert.equal(hoursOfHistory, result.length);
        viewcountdata.viewcounts = result;
        //send to specific socket or send to all?
        if(clientsocket)
            clientsocket.emit('viewupdates', viewcountdata);
        else
            io.sockets.emit('viewupdates', viewcountdata);
    };

    //helper function for asynchronously querying the db for each timestamp range.
    //TBD: would one huge range for 24 hours with sort in client perform better?
    var getViewCount = function(timestamp, callback)
    {
        viewlogsCollection.find({'time' : {$gte: timestamp.start, $lte: timestamp.end}}).toArray(function(err, documents)
        {
            callback(null,documents.length);
        });
    };

    //for each time range, get the view count. then send the results to the server
    async.map(timeRanges, getViewCount, sendViewCountsToClients);
}
//once every hour (at :00 minutes), we need to update the view counts and labels
var schedulerjob = scheduler.scheduleJob({minute: 0}, function()
{
    console.log("an hour has passed, update clients with new labels");
    SendViewCountToClients();
});
