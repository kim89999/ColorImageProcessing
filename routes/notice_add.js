var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	if(req.session.user){
        res.render('notice_add');
    }
    else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>세션이 만료됨</h1>');
				res.write("<br><br><a href='/'>로그인</a>");
				res.end();
    }
});

module.exports = router;