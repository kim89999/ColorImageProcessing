var express = require('express');
var router = express.Router();

// 몽고디비 모듈 사용
var mongodb = require('./mongodb');


// 사용자 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route('/').post(function(req, res) {

	var database = mongodb.connection();
	console.log('/signup 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPw = req.body.pw || req.query.pw;
    var paramName = req.body.name || req.query.name;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPw + ', ' + paramName);
	
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
	if (mongodb.connection()) {
		addUser(mongodb.connection(), paramId, paramPw, paramName, function(err, result) {
			if (err) {throw err;}
			
            // 결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
			if (result && result.insertedCount > 0) {
				console.dir(result);
 
				res.redirect('/');

			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
});

//사용자를 추가하는 함수
var addUser = function(database, id, pw, name, callback) {
	console.log('addUser 호출됨 : ' + id + ', ' + pw + ', ' + name);
	
	// users 컬렉션 참조
	var users = database.collection('CIP_user');

	// id, password, username을 이용해 사용자 추가
	users.insertMany([{"id":id, "pw":pw, "name":name, "grade":"bronze"}], function(err, result) {
		if (err) {  // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
		
        // 에러 아닌 경우, 콜백 함수를 호출하면서 결과 객체 전달
        if (result.insertedCount > 0) {
	        console.log("사용자 레코드 추가됨 : " + result.insertedCount);
        } else {
            console.log("추가된 레코드가 없음.");
        }
        
	    callback(null, result);
	     
	});
}

module.exports = router;