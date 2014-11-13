// connect to our socket server
var socket = io.connect('http://127.0.0.1:3000/');

var app = app || {};

// shortcut for document.ready
$(function(){

    //helper functions for array generation using a python like range() interface
    function zero(){ return 0; }
    function range(start, stop, step){
        if (typeof stop=='undefined'){
            // one param defined
            stop = start;
            start = 0;
        };
        if (typeof step=='undefined'){
            step = 1;
        };
        if ((step>0 && start>=stop) || (step<0 && start<=stop)){
            return [];
        };
        var result = [];
        for (var i=start; step>0 ? i<stop : i>stop; i+=step){
            result.push(i);
        };
        return result;
    };

    var data = {
        labels: range(0,24,1).map(function(x){ return "-" + ("0" + x + ":00").substr(-5) }),
        datasets: [
            {
                label: "Views per hour",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: range(0,24,1).map(zero)
            }
        ]
    };
    // Get the context of the canvas element we want to select
    var ctx = $("#myChart").get(0).getContext("2d");
    myLineChart = new Chart(ctx).Line(data);

    //realtime listener for view count updates
	socket.on("viewupdates", function(msgdata){
        //update line chart counts and labels
        //TBD: make this more efficient by only passing labels once an hour. no need to update labels every time viewcount is updated
        //TBD2: make this more efficient by only passing viewcount for latest hour. view counts shouldn't be able to be updated historically.
        for(var i = 0; i < msgdata.viewcounts.length; i++)
        {
            myLineChart.datasets[0].points[i].value = msgdata.viewcounts[i];
            myLineChart.scale.xLabels[i] = msgdata.labels[i];
        }
        myLineChart.update();
    });
});
