
var http = require('http');

exports.getUsersNearby = function(loc, count, cb) {

	//http://search.scruffapp.com/app/search/location?longitude=-117.275552&client_version=4.7017&count=40&latitude=32.846688&device_type=1
	// count appears to be ignored
 
    http.get({
        host: 'search.scruffapp.com',
        path: '/app/search/location?longitude=' + loc.lon + '&client_version=4.7017&count=' + count + '&latitude=' + loc.lat + '&device_type=1'
    }, function(res) {
        // explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
        res.setEncoding('utf8');
 
        // incrementally capture the incoming response body
        var body = '';
        res.on('data', function(d) {
            body += d;
        });
 
        // do whatever we want with the response once it's done
        res.on('end', function() {
            try {
                var parsed = JSON.parse(body);
            } catch (err) {
                console.error('Unable to parse response as JSON', err);
                return cb(err);
            }
 
            // pass the relevant data back to the callback
	    // reparse to shrink?
            cb(null, parsed);
        });
    }).on('error', function(err) {
        // handle errors with the request itself
        console.error('Error with the request:', err.message);
        cb(err);
    });
 
};

exports.getUser = function(loc, id, cb) {

	//http://app.scruffapp.com/app/profile?target=100325809&longitude=-117.275625&client_version=4.7017&latitude=32.846736&device_type=1
 
    console.log("Looking for user " + id);
    http.get({
        host: 'app.scruffapp.com',
        path: '/app/profile?target=' + id + '&longitude=' + loc.lon + '&client_version=4.7017&latitude=' + loc.lat + '&device_type=1'
    }, function(res) {
        // explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
        res.setEncoding('utf8');

        // incrementally capture the incoming response body
        var body = '';
        res.on('data', function(d) {
            body += d;
        });
 
        // do whatever we want with the response once it's done
        res.on('end', function() {
            try {
		//console.error(body);
                var parsed = JSON.parse(body);
            } catch (err) {
                console.error('Unable to parse response as JSON', err);
                return cb(err);
            }
 
            // pass the relevant data back to the callback
	    // reparse to shrink?
            cb(null, parsed);
        });
    }).on('error', function(err) {
        // handle errors with the request itself
        console.error('Error with the request:', err.message);
        cb(err);
    });
 
};

