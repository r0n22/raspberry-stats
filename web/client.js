/*
 * !!DISCLAIMER!!
 * 
 * Hey there! Thanks for reading/using/editing this code, I just wanted to say a couple of things :
 * 
 * First of all this code isn't at it's best because I did a rather bad job at using some of the API's possibilities.
 * Second of all, I'm a fifteen year developer at the making of this code so I'm not so experienced in a general sense.
 * 
 * If you make any improvements to the code, email me your forked github repository of this code and I'll take a look at it just to learn :)
 * 
 * You can also email me at : 96aa48 [at] gmail.com
 * 
 * Thanks !
 * 
 */

//Change this variable to your server address.

var server_location = 'http://192.168.0.100';

//Change this variable to your desired interval to check. (in milliseconds)

var check_interval = 5000;
	
//Make a new socket that connects to the server socket.
var socket = io.connect(server_location);

//A variable that I use to make something toggle with an interval.

//The making of an empty graph object later used to populate the positions for the graph nodes.
var graph = {
		mem : [],
		mem_free : [],
		mem_use : [],
		mem_total : [],
		cpu : [],
		hostname : undefined
}

//I was lazy with coming up with a solution to a problem, so I made this variable.
var staticStats;


//An interval that sends an request every second to make the main table update it's information.
setInterval(function () {
	socket.emit('request', {type:'data'});
},1000);

//Another interval toggle the graph
setInterval(function () {
	console.log("Made a request to the server");
	socket.emit('request', {type:'graph'});
}, check_interval);

//The init of the socket connection with the server.
socket.on('connect', function () { 	
	//When a response comes with 'stats' as an header then this executed.
	socket.on('stats', function (data) {
			staticStats = data;
			makeStats(data);
	});
	//When a response comes with 'graph' as an header then this executed.
	socket.on('graph', function (data) {
		//If the interval has made sure that the graph is writable, then the graph data get's populated.
		graph.mem = graph.mem.concat(data.mem);
		graph.mem_free = graph.mem_free.concat(data.mem_free);
		graph.mem_use = graph.mem_use.concat(data.mem_use);
		graph.mem_total = graph.mem_total.concat(data.mem_total);
		graph.cpu = graph.cpu.concat(data.cpu);
		
		//Make a graph with the just added information.
		makeGraph(graph);
	});
});

function makeStats(stats) {
	//Remove all data in the table.
	$('tbody').html('');
	
	//Reinsert all of the data into the table.
	$('tbody').append('<tr><td>Memory</td><td>' + stats.performance.memory.total + '</td></tr>');
	$('tbody').append('<tr><td>Free Memory</td><td>' + stats.performance.memory.free + '</td></tr>');
	$('tbody').append('<tr><td>Memory In-Use</td><td>' + stats.performance.memory.use + '</td></tr>');
	$('tbody').append('<tr><td>Percentage</td><td>' + stats.performance.memory.percentage + '%</td></tr>');
	$('tbody').append('<tr><td>CPU Temperature</td><td>' + stats.performance.temperture + ' &#176;C</td></tr>');
	$('tbody').append('<tr><td>Platform</td><td>' + stats.os.sum + '</td></tr>');
	$('tbody').append('<tr><td>Uptime</td><td>' + stats.uptime + '</td></tr>');
	$('tbody').append('<tr><td>Hostname</td><td>' + stats.hostname + '</td></tr>');
}

function makeGraph(stats) {
	//This is the function that makes the chart, based on highcharts.
	$('#graph').highcharts({
        title: {
            text: 'Memory and CPU Temperature',
            x: -20 //center
        },
        subtitle: {
            text: 'On ' + staticStats.hostname,
            x: -20
        },
        yAxis: {
            title: {
                text: 'Temperature (°C) / Percentage (%)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'CPU',
            data: stats.cpu,
            tooltip : {
            	valueSuffix: '°C'
            }
        }, 
        {
            name: 'Memory - Percentage',
            data: stats.mem,
            tooltip : {
            	valueSuffix: '%'
            }
        }, {
        	name: 'Memory - Free',
        	data: stats.mem_free,
        	tooltip : {
        		valueSuffix: 'MB'
        	}
        }, {
        	name: 'Memory - In-Use',
        	data: stats.mem_use,
        	tooltip : {
        		valueSuffix: 'MB'
        	}
        }, {
        	name: 'Memory - Total',
        	data: stats.mem_total,
        	tooltip : {
        		valueSuffix: 'MB'
        	}
        }]
    });
}