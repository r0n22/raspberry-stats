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

//All of the needed requirements.
var app = require('connect')();
var fs = require('fs');
var os = require('os');
var server = require('http').createServer(app) 
var io = require('socket.io').listen(server);

//Make server listen on port 80
server.listen(80);

//This is the part where the code handles the web requests.
app.use('/', function (request, response) {
	
	/*
	 * Here are a couple of if statements for the different files that may be requested by the client.
	 * if *requested file* then give *requested file*
	 */
	
	if (request.url == '/favicon.ico' || request.url == '/pi.png') {
		fs.readFile('web/pi.png', function (err, data) {
			if (err) throw err;
			response.setHeader('Content-Type', 'image/png');
			response.end(data);
		});
		return
	}
	else if (request.url == '/style.css') {
		fs.readFile('web/style.css', function (err, data) {
			if (err) throw err;
			response.setHeader('Content-Type', 'text/css');
			response.end(data + '');
		});
	}
	else if (request.url == '/client.js') {
		fs.readFile('web/client.js', function (err, data) {
			response.setHeader('Content-Type', 'text/javascript');
			response.end(data + '');
		});
	}
	else {
		//If the request doesn't match the above requests, serve the app.html.
		fs.readFile('web/app.html', function (err, data) {
			if (err) throw err;
			response.end(data + '');
		});
	}
	
	//Initialize the Socket.io sockets.
	
	io.sockets.on('connection', function (socket) {
		
		//If the socket gets a request with the header 'request' then this executes.
		socket.on('request', function (data){
			if (data.type == 'graph') {
				//Make the socket emit separate data for the graphs.
				console.log('Server Graph data');
				socket.emit('graph', makeGraph());	
			}
			else if (data.type == 'data') {
				//Read the temperature from the system.
				
				fs.readFile('/sys/class/thermal/thermal_zone0/temp', function (err, data) {	
						
						//Convert the output from millicentrigrades to centigrades. 
						
						var temp = Math.floor(parseInt(data) / 100) / 10;
						
						//Make the socket emit all of the data needed by the client :
						
						socket.emit('stats', {
								"os" : {
									"sum" : os.type() + " : " + os.release(),
									"type" : os.type(),
									"platform" : os.platform()
								},
								"uptime" : formatTime(os.uptime()),
								"hostname" : os.hostname(),
								"performance" : {
									"cpu" : os.cpus(),
									"temperture" : Math.floor((parseInt(data) / 1000) * 10) / 10,
									"memory" : {
										"free" : Math.floor((os.freemem() / 1024) / 1024) + "MB",
										"use" : Math.floor(((os.totalmem() - os.freemem()) / 1024) / 1024) + "MB",
										"total" : Math.floor((os.totalmem() / 1024) / 1024) + "MB",
										"percentage" : Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
									}
								}
						});	
				});
			}
			
		});
	});
});

//A simple function to populate the graphStats object with the y position for the next point. 

function makeGraph() {
	//Making of blank graphStats

	var graph = {
		mem : [],
		mem_free : [],
		mem_use : [],
		mem_total : [],
		cpu : [],
		hostname : os.hostname()
	};
	
	fs.readFile('/sys/class/thermal/thermal_zone0/temp', function (err, temp) {
		graph.cpu = [Math.floor(parseInt(temp) / 100) / 10];
	});
	graph.mem = [Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)];
	graph.mem_free = [Math.floor((os.freemem() / 1024) / 1024)];
	graph.mem_use = [Math.floor(((os.totalmem() - os.freemem()) / 1024) / 1024)];
	graph.mem_total = [Math.floor((os.totalmem() / 1024) / 1024)];
	return graph;
}

//A simple function to convert the os.uptime() output to a human readable time.

function formatTime(secs)
{
    var hours = Math.floor(secs / (60 * 60));
   
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
 
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
   
    if (minutes < 10) {
    	minutes = '0'
    }
    
    if (hours < 10) {
    	hours = '0' + hours;
    }
    if (seconds < 10) {
    	seconds = '0' + seconds;
    }
   
    var time = hours + ":" + minutes + ":" + seconds;
  
    return time;
}