var express = require('express');
var trilateration = require('../model/trilateration');
var scruff = require('../model/scruff');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('trilateration/index.html', { title: 'CSE 227 Project - Trilateration' });
});

router.post('/', function(req, res) {

// resutls from scruff are in meters, utility expects km

  // For given location and user id, pull three distances
  var lon1 = 0;
  var lon2 = 0;
  var lon3 = 0;
  var lat1 = 0;
  var lat2 = 0;
  var lat3 = 0;
  var dst1 = 0;
  var dst2 = 0;
  var dst3 = 0;
  var beacon1, beacon2, beacon3;
  var result;

	// Somewhere in Pacific Ocean
	lat1 = 32.900258;
	lon1 = -117.508279;

	// N SD County
	lat2 = 33.236039;
	lon2 = -117.064772;

	// S SD County
	lat3 = 32.583495;
	lon3 = -116.796980;

       	scruff.getUser({"lat": lat1, "lon": lon1}, req.body.id, function callback(err,data) { 
		console.log("Distance 2: " + JSON.stringify(data.results[0].dst));
		dst1 = Number(JSON.stringify(data.results[0].dst)) / 1000;
		beacon1 = new trilateration.Beacon(lat1, lon1, dst1);

		scruff.getUser({"lat": lat2, "lon": lon2}, req.body.id, function callback(err,data) { 
			console.log("Distance 2: " + JSON.stringify(data.results[0].dst));
			dst2 = Number(JSON.stringify(data.results[0].dst)) / 1000;
			beacon2 = new trilateration.Beacon(lat2, lon2, dst2);

			scruff.getUser({"lat": lat3, "lon": lon3}, req.body.id, function callback(err,data) { 
				console.log("Distance 3: " + JSON.stringify(data.results[0].dst));
				dst3 = Number(JSON.stringify(data.results[0].dst)) / 1000;
				beacon3 = new trilateration.Beacon(lat3, lon3, dst3);
				  console.log('ready to go');
				  console.log(beacon1);
				  console.log(beacon2);
				  console.log(beacon3);

				  var pos = trilateration.trilaterate([beacon1, beacon2, beacon3]);

			  result = {"location1": { "lat": lat1, "lon": lon1, "dst": dst1},
				    "location2": { "lat": lat2, "lon": lon2, "dst": dst2},
				    "location3": { "lat": lat3, "lon": lon3, "dst": dst3},
				    "position" : { "lat": pos[0], "lon": pos[1]}};

			  console.log("Results:");
			  console.log(result);
		
			  res.send(JSON.stringify(result));
			});
		});
	});

});

module.exports = router;






