var express = require('express');
var trilateration = require('../model/trilateration');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('trilateration/index.html', { title: 'CSE 227 Project - Trilateration' });
});


router.post('/', function(req, res) {

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
  var result;

	lon1 = Number(req.body.lon);
	lat1 = Number(req.body.lat);
	dst1 = Number(req.body.dst);

	lon2 = lon1 + .008;
	lat2 = lat1 + .008;
	dst2 = dst1 + 500;

	lon3 = lon1 + .001;
	lat3 = lat1 + .001;
	dst3 = dst1 + 200;

  // Start Calculation
  var beacons = [ new trilateration.Beacon(35.000000, -120.000000, 189.419265289145) , new trilateration.Beacon(35.000005, -120.000010, 189.420325082156) , new trilateration.Beacon(35.000000, -120.000020, 189.420689733286) ];
 
  console.log('ready to go');
  var pos = trilateration.trilaterate(beacons);

  result = {"location1": { "lat": lat1, "lon": lon1, "dst": dst1},
  	    "location2": { "lat": lat2, "lon": lon2, "dst": dst2},
            "location3": { "lat": lat3, "lon": lon3, "dst": dst3},
            "position" : { "lat": pos[0], "lon": pos[1], "dst": 0}}

  console.log(result);

  res.send(JSON.stringify(result));

});

module.exports = router;






