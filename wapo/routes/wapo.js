var express = require('express');
var router = express.Router();
var http = require('http');
var querystring = require('querystring');
var zlib = require('zlib');
var trilateration = require('../model/trilateration');

router.get('/', function(req, res) {
  res.render('index.html');
});

function sendRequest(host, path, callback) {

	var request1 = http.request( {
		host: host,
		method: "GET",
		path: path
	}, function(response1) {

		var body = [];
		response1.on('data', function(d) {
			//console.log('STATUS: ' + response1.statusCode);
			//console.log('HEADERS: ' + JSON.stringify(response1.headers));
			body.push(d);
		});

		// do whatever we want with the response once it's done
		response1.on('end', function() {
			var buffer = Buffer.concat(body);
			//res.send(JSON.parse(buffer.toString()));
			callback(JSON.parse(buffer.toString()));
		});

		response1.on('error', function(err) {
			console.log('ERROR: ' + err);
			//res.send(err);
		});
	});

	request1.end();
};


router.get('/trilaterate', function(req, res) {

        console.log('Trilaterating all users');


	// Gets an initial list centered on UCSD
	// Then gets 3 distacnes from the surrounding area

	var results = [];

	// UCSD
	var lat0 = 32.880883;
	var lon0 = -117.237581;

	// Vista
	var lat1 = 33.202641;
	var lon1 = -117.287019;
	var dst1 = 0;

	// East SD County
	var lat2 = 32.697898;
	var lon2 = -116.755556;
	var dst2 = 0;

	//Pacific ocean off of SD
	var lat3 = 32.638940;
	var lon3 = -117.671541;
	var dst3 = 0;

	

	var host = "wapoapp-usersnearest-g.trafficmanager.net";
	var path = "/20120508/Services/BoysNearestGetService.svc/GetBoysNearest?";
        var query0 = path + querystring.stringify({ "thisBoyLat" : lat0 , "thisBoyLon" : lon0 });
        var query1 = path + querystring.stringify({ "thisBoyLat" : lat1 , "thisBoyLon" : lon1 });
        var query2 = path + querystring.stringify({ "thisBoyLat" : lat2 , "thisBoyLon" : lon2 });
        var query3 = path + querystring.stringify({ "thisBoyLat" : lat3 , "thisBoyLon" : lon3 });

	console.log("Looking nearby: " + host + query0 );

	sendRequest(host, query0, function ( data ) {
		// add raw data to results array

		for(var i = 0; i < data["Value"]["Boys"].length; i++) {
			//console.log(data["Value"]["Boys"][i]["Username"]);
			//console.log(data["Value"]["Boys"][i]["Distance"]);
			//console.log(data["Value"]["Boys"][i]["Uid"]);
			
			var user = {
				"Uid": data["Value"]["Boys"][i]["Uid"],
				"Username": data["Value"]["Boys"][i]["Username"],
				"Dst1": null,
				"Lat1": null,
				"Lon1": null,
				"Dst2": null,
				"Lat2": null,
				"Lon2": null,
				"Dst3": null,
				"Lat3": null,
				"Lon3": null,
				"Lat" : null,
				"Lon" : null,
				"Done" : 0
			};
			//console.log(user);
			results.push(user);
		}

		console.log("Retrieved " + results.length + " users");

		
		console.log("Sending request 1: " + host + query1 );
		sendRequest(host, query1, function ( data ) {

			console.log("Correlating first result set");
			for (var i = 0; i < results.length; i++) {
				for (var j = 0; j < data["Value"]["Boys"].length; j++) {
					if ( results[i]["Uid"] == data["Value"]["Boys"][j]["Uid"] ) {
						//console.log ("Matching " + results[i]["Uid"]);
						results[i]["Dst1"] = data["Value"]["Boys"][j]["Distance"];
						results[i]["Lat1"] = lat1;
						results[i]["Lon1"] = lon1;
						results[i]["Done"]++;

						//console.log("Updated: " + results[i]);
					}
				}
			}

			console.log("Sending request 2: " + host + query2 );
			sendRequest(host, query2, function ( data ) {
				// correlate data

				console.log("Correlating second result set");
				for (var i = 0; i < results.length; i++) {
					for (var j = 0; j < data["Value"]["Boys"].length; j++) {
						if ( results[i]["Uid"] == data["Value"]["Boys"][j]["Uid"] ) {
							//console.log ("Matching " + results[i]["Uid"]);
							results[i]["Dst2"] = data["Value"]["Boys"][j]["Distance"];
							results[i]["Lat2"] = lat2;
							results[i]["Lon2"] = lon2;
							results[i]["Done"]++;

							//console.log("Updated: " + results[i]);
						}
					}
				}

				console.log("Sending request 3: " + host + query3 );
				sendRequest(host, query3, function ( data ) {
					// correlate data again
					console.log("Correlating third result set");
					for (var i = 0; i < results.length; i++) {
						for (var j = 0; j < data["Value"]["Boys"].length; j++) {
							if ( results[i]["Uid"] == data["Value"]["Boys"][j]["Uid"] ) {
								//console.log ("Matching " + results[i]["Uid"]);
								results[i]["Dst3"] = data["Value"]["Boys"][j]["Distance"];
								results[i]["Lat3"] = lat3;
								results[i]["Lon3"] = lon3;
								results[i]["Done"]++;

								//console.log("Updated: " + results[i]);
							}
						}
					}


					// Trilaterating each result
					console.log("Trilaterating results");
					for (var i = 0; i < results.length; i++) {
						if ( results[i]["Done"] == 3 ) {
							var pos = trilaterate(results[i]);
							// Lat was consitently off by almost 1km - this adjusts for that.. should be 1/112.5 but this gives better results
							results[i]["Lat"] = pos["lat"] + 1/96;
							results[i]["Lon"] = pos["lon"];
						}
					}
					

					console.log("Sending Results");
					// send results
					res.send(results);
				});
			});
		});
	});
	
});


function trilaterate(user) {

	//console.log("Trilaterating request for: "+ user);

	var beacon1 = null;
	var beacon2 = null;
	var beacon3 = null;

	// 1.60934 = km/mile
	//beacon1 = new trilateration.Beacon(user["Lat1"], user["Lon1"], Number(user["Dst1"])*1.60934);
	//beacon2 = new trilateration.Beacon(user["Lat2"], user["Lon2"], Number(user["Dst2"])*1.60934);
	//beacon3 = new trilateration.Beacon(user["Lat3"], user["Lon3"], Number(user["Dst3"])*1.60934);
	beacon1 = new trilateration.Beacon(parseFloat(user["Lat1"]), parseFloat(user["Lon1"]), parseFloat(user["Dst1"])*1.60934);
	beacon2 = new trilateration.Beacon(parseFloat(user["Lat2"]), parseFloat(user["Lon2"]), parseFloat(user["Dst2"])*1.60934);
	beacon3 = new trilateration.Beacon(parseFloat(user["Lat3"]), parseFloat(user["Lon3"]), parseFloat(user["Dst3"])*1.60934);
	
	console.log('ready to go');
	console.log(beacon1);
	console.log(beacon2);
	console.log(beacon3);

	var pos = trilateration.trilaterate([beacon1, beacon2, beacon3]);


	//console.log("Results:");
	//console.log(pos);


	var result = {"lat": pos[0], "lon": pos[1]};
	return result;

};


module.exports = router;
