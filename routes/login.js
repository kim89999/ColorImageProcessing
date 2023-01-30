var express = require('express');
var router = express.Router();
var app = express();

router.route('/').get(function(req, res) {
    
    res.render('login');

});

router.route('/signup').post(function(req, res) {
    
    res.render('signup');

});


module.exports = router;