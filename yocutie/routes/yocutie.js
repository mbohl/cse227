var express = require('express');
var router = express.Router();
var http = require('http');
var querystring = require('querystring');
var zlib = require('zlib');

router.get('/auth', function(req, res) {

	// expects longitude, latitude, session, and cookie value
	console.log('Attempting Authorization');

	var postData = querystring.stringify({
		"country": "US",
		"password": "i8UCSD88",
		"device_name":"iPhone",
		"need_auth": "no",
		"device_uuid": "5CFB0788-08EC-4DE5-B80D-3DF2D5B4E3C2",
		"module":"login",
		"email": "schoolman227@gmail.com",
		"ln": "en",
		"is_metric_system": "n",
		"session_id": "",
		"notification_enabled": "0",
		"account_type": "2" });

	console.log("URL data: " + postData);
		
	var yoCutieRequest = http.request( {
		host: "www.yocutie.com",
		method: "GET",
		path: "/backend/api/handle.php?" + postData,
		headers: {
			"User-Agent": "YoCutie/1.5.5 CFNetwork/711.1.16 Darwin/14.0.0"
		}
	}, function(yoCutieResponse) {

		var body = [];
		yoCutieResponse.on('data', function(d) {
			console.log('STATUS: ' + yoCutieResponse.statusCode);
			console.log('HEADERS: ' + JSON.stringify(yoCutieResponse.headers));
			body.push(d);
		});

		yoCutieResponse.on('error', function(err) {
			console.log('ERROR: ' + err);
			res.send(err);
		});

		// do whatever we want with the response once it's done
		yoCutieResponse.on('end', function() {
			var buffer = Buffer.concat(body);
			zlib.gunzip(buffer, function(err, decoded) {
				console.log('BODY: ' + decoded.toString());
				res.send(decoded.toString());
			});
			
		});
	});

	console.log("Done with registering request, writing data.");
		
	//yoCutieRequest.write(postData);
	yoCutieRequest.end();

});

router.get('/findnearby/:limit,:session_id', function(req, res) {

	console.log('Getting users near some location using params: ' + req.params.limit + " " + req.params.session_id);

	var postData = querystring.stringify({
		"limit": req.params.limit,
		"session_id": req.params.session_id ,
		"module": "profiles",
		"device_uuid": "BDB4E61E-66E2-4D23-8D46-29E6E245CCEE",
		"start_time": "1424323202.000000",
		"offset": "0"});
	
	var yoCutieRequest = http.request( {
		host: "www.yocutie.com",
		method: "GET",
		headers: {
			"User-Agent": "YoCutie/1.5.5 CFNetwork/711.1.16 Darwin/14.0.0"
		},
		path: "/backend/api/handle.php?" + postData
	}, function(yoCutieResponse) {

		var body = [];
		yoCutieResponse.on('data', function(d) {
			console.log('STATUS: ' + yoCutieResponse.statusCode);
			console.log('HEADERS: ' + JSON.stringify(yoCutieResponse.headers));
			body.push(d);
		});

		// do whatever we want with the response once it's done
		yoCutieResponse.on('end', function() {
			var buffer = Buffer.concat(body);
			zlib.gunzip(buffer, function(err, decoded) {
				console.log('BODY: ' + decoded.toString());
				res.send(decoded.toString());
			});
		});

		yoCutieResponse.on('error', function(err) {
			console.log('ERROR: ' + err);
			res.send(err);
		});
	});

	yoCutieRequest.end();
		
	console.log("Request sent");

});


// Sets location for currently logged in user
router.get('/setlocation/:session_id,:lat,:lon', function(req, res) {

	// expects longitude, latitude, session, and cookie value
	console.log("Setting location for logged in user");

	var postData = querystring.stringify({
		"session_id": req.params.session_id,
		"property":"geo_location",
		"module":"update_profile",
		"device_uuid":"BDB4E61E-66E2-4D23-8D46-29E6E245CCEE",
		"geo_location": req.params.lat + ";" + req.params.lon});

	console.log("Making request with params: " + postData);
		
	var yoCutieRequest = http.request( {
		host: "www.yocutie.com",
		method: "POST",
		path: "/backend/api/handle.php",
		headers: {
			"User-Agent": "YoCutie/1.5.5 CFNetwork/711.1.16 Darwin/14.0.0",
			"Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": postData.length,
			"Content-Transfer-Encoding": "8bit"
		}
	}, function(yoCutieResponse) {
		var body = [];
		yoCutieResponse.on('data', function(d) {
		    body.push(d);
		});

		// do whatever we want with the response once it's done
		yoCutieResponse.on('end', function() {
			var buffer = Buffer.concat(body);
			zlib.gunzip(buffer, function(err, decoded) {
				console.log('BODY: ' + decoded.toString());
				res.send(decoded.toString());
			});
			
		});
	});

	console.log("Finished request");
		
	yoCutieRequest.write(postData);
	yoCutieRequest.end();
	
});


module.exports = router;
