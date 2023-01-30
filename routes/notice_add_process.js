var express = require('express');
var router = express.Router();

// 몽고디비 모듈 사용
var mongodb = require('./mongodb');


router.route('/').get(function(req, res) {
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

// 사용자 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route('/').post(function(req, res) {

	var database = mongodb.connection();
	console.log('/notice_add_process 호출됨.');

    var paramTitle = req.body.title;
    var paramContent = req.body.content;
    var paramName = req.session.user["name"];
	
    console.log('요청 파라미터 : ' + paramTitle + ', ' + paramContent + ', ' + paramName);
	
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
	if (mongodb.connection()) {
		addBoard(mongodb.connection(), paramTitle, paramContent, paramName, function(err, result) {
			if (err) {throw err;}
			
            // 결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
			if (result && result.insertedCount > 0) {
				console.dir(result);
 
				res.redirect('/notice');

			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>공지 추가 실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
});

//공지사항을 추가하는 함수
var addBoard = function(database, title, content, name, callback) {
	console.log('addBoard 호출됨 : ' + title + ', ' + content + ', ' + name);
	
	// boards 컬렉션 참조
	var boards = database.collection('CIP_board');

	// title, content, name 이용해 공지 추가
	boards.insertMany([{"title":title, "content":content, "name":name, "date":new Date()}], function(err, result) {
		if (err) {  // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
		
        // 에러 아닌 경우, 콜백 함수를 호출하면서 결과 객체 전달
        if (result.insertedCount > 0) {
	        console.log("공지 레코드 추가됨 : " + result.insertedCount);
        } else {
            console.log("추가된 레코드가 없음.");
        }
        
	    callback(null, result);
	     
	});
}

module.exports = router;