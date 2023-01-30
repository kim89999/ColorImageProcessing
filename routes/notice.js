var express = require('express');
const connect = require('mongodb');
var router = express.Router();

// 몽고디비 모듈 사용
var mongodb = require('./mongodb');

router.get('/', function(req, res, next) {
	if(req.session.user){
        var database = mongodb.connection();
        if (database) {
            authBoard(database, function(err, docs) {
                if (err) {throw err;}
                
                // 조회된 레코드가 있으면 성공 응답 전송
                if (docs) {
                    console.log("공지사항 성공");

                    // 세션 추가
                    req.session.board = { docs: docs };
    
                    res.render('notice', {_id: req.session.user["_id"], docs: req.session.board["docs"]});
    
                } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
                    console.log("공지사항 실패");
                    res.render('notice');
                }
            });
        } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
            console.log('데이터베이스 연결 실패');
        }
        
    }
    else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>세션이 만료됨</h1>');
				res.write("<br><br><a href='/'>로그인</a>");
				res.end();
    }
});


router.get('/:_id', function(req, res, next) {
	if(req.session.user){
        console.log(req.params._id);
        var database = mongodb.connection();
        if (database) {
            for (var i = 0; i < req.session.board["docs"].length; i++) {
                if (req.params._id == req.session.board["docs"][i]._id)
                    var paramTitle = req.session.board["docs"][i].title;
            }
            authDetail(database, paramTitle, function(err, docs) {
                if (err) {throw err;}
                
                // 조회된 레코드가 있으면 성공 응답 전송
                if (docs) {
                    console.log("공지사항 조회");
    
                    res.render('notice_detail', {_id: req.session.user["_id"], docs: docs});
    
                } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
                    console.log("공지사항 조회 실패");
                    res.render('notice');
                }
            });
        } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
            console.log('데이터베이스 연결 실패');
        }
        
    }
    else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>세션이 만료됨</h1>');
				res.write("<br><br><a href='/'>로그인</a>");
				res.end();
    }
});

router.route('/:index').post(function(req, res) {
    console.log("접근");
    res.redirect('/index');
});

router.route('/:logout').post(function(req, res) {
    res.redirect('/');
});

router.route('/:notice').post(function(req, res) {
    res.redirect('/notice');
});

var authDetail = async function(database, title, callback) {
	console.log('authDetail 호출됨');
	
    // CIP 컬렉션 참조
	var CIP = database.collection('CIP_board');
    console.log(title);

    //  제목을 이용해 검색
	CIP.find({"title":title}).toArray(function(err, docs) {
		if (err) { // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
		
	    if (docs.length > 0) {  // 조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
	    	console.log('값 찾음.');
	    	callback(null, docs);
	    } else {  // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
	    	console.log("값 없음.");
	    	callback(null, null);
	    }
	});
}

var authBoard = async function(database, callback) {
	console.log('authBoard 호출됨');
	
    // CIP 컬렉션 참조
	var CIP = database.collection('CIP_board');

    // 검색
	CIP.find({}, {title:1, content:1, name: 1, date:{ $substr: [ "$date", 0, 10] }}).toArray(function(err, docs) {
		if (err) { // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
		
	    if (docs.length > 0) {  // 조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
	    	console.log('값 찾음.');
	    	callback(null, docs);
	    } else {  // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
	    	console.log("값 없음.");
	    	callback(null, null);
	    }
	});
}

module.exports = router;