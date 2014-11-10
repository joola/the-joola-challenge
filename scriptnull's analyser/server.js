var mysql = require('mysql');
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
var path = require('path');
visits = new Object();

server.listen(8080 , function(){
	console.log('server started');
});

//mysql connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
});
connection.connect();


app.use(express.static(path.join(__dirname, 'public')));

app.get('/' , function ( req , res ) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var date = new Date();
	var d = date.getDate() + ':' + date.getMonth() +':' + date.getFullYear(); 
	var hourtime = parseInt(date.toString().split(' ')[4].split(':')[0]);
	var sql = "insert into pageanalyst.logtable (ip,date,hourtime) values('"+ ip +"','"+d+"',"+ hourtime.toString() +");"
	connection.query( sql , function(err, rows, fields){
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log('logged ' + ip + ' ' +  d + ' ' + hourtime);
		}
	});
	res.sendFile( __dirname + "/index.html");
});


visits["index"] = 0 ;

io.sockets.on('connection', function (socket) {
	console.log('connection established');
	socket.on('countUp' , function(data)
	{		
		var sql = "select ip , hourtime  from pageanalyst.logtable"
		connection.query( sql , function(err, rows, fields){
			if(err)
			{
				console.log(err);
			}
			else
			{
				console.log(rows);
				io.sockets.emit('countUpNotifier' , rows );
			}
		});

		
	});
});
