var express = require('express');
var scruff = require('../model/scruff');
var router = express.Router();

router.get('/index.html', function(req, res) {
  res.render('users/index.html', { title: 'CSE 227 Project - Trilateration' });
});

/* GET users listing. */
router.get('/', function(req, res) {

  console.log('Getting all users near La Jolla');
  var loc = {'lat': '32.846688', 'lon': '-117.275552'};
  var count = 5;
  scruff.getUsersNearby(loc, count, function(err, obj){
				      if (err) {
					res.send(err);
				      } else {
					res.send(obj);
				      }
				});

});

router.get('/:lat,:lon', function(req, res) {

  console.log('Getting users near some location');
  var loc = {'lat': req.params.lat, 'lon': req.params.lon};
  var count = 5;
  scruff.getUsersNearby(loc, count, function(err, obj){
				      if (err) {
					res.send(err);
				      } else {
					res.send(JSON.stringify(obj));
				      }
				});

});


router.get('/:id', function(req, res) {

  var loc = {'lat': '32.846688', 'lon': '-117.275552'};
  scruff.getUser(loc, req.params.id, function(err, obj){
				      if (err) {
					res.send(err);
				      } else {
					res.send(JSON.stringify(obj));
				      }
				});

});

module.exports = router;
