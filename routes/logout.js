var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    
    console.log('/logout 호출됨');
    
    if(req.session.user){
        console.log('Session logout 성공');
        
        req.session.destroy(function(err){
            if(err) throw err;
            console.log('세션 삭제하고 로그아웃됨');
            res.redirect('/');
        });
    }
    else{
        console.log('로그인 상태 아님');
        res.redirect('/');
    }

});

module.exports = router;