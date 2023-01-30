var express = require('express');
var router = express.Router();
var app = express();

// // 몽고디비 모듈 사용
var mongodb = require('./mongodb');

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route('/').post(function(req, res) {

	var database = mongodb.connection();
	console.log('/index 호출됨.');

    // 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPw = req.body.pw || req.query.pw;
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPw);
    
    // 데이터베이스 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if (database) {
		authUser(database, paramId, paramPw, function(err, docs) {
			if (err) {throw err;}
			
            // 조회된 레코드가 있으면 성공 응답 전송
			if (docs) {
				console.log("Session Login 성공");
                var grade = docs[0].grade;
				var name = docs[0].name;
				var _id = docs[0]._id;

                // 세션 추가
                req.session.user = {
					_id: _id,
                    id: paramId,
                    grade: grade,
					name: name,
                    authorized: true
                };
                console.log(req.session.user);

                res.render('index', {"user": req.session.user});

			} else {  // 조회된 레코드가 없는 경우 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>로그인  실패</h1>');
				res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
				res.write("<br><br><a href='/'>다시 로그인하기</a>");
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}
	
});

router.route('/').get(function(req, res) {
	if(req.session.user){
        res.render('index', {"user": req.session.user});
    }
    else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>세션이 만료됨</h1>');
				res.write("<br><br><a href='/'>로그인</a>");
				res.end();
    }
});

// 사용자를 인증하는 함수
var authUser = function(database, id, pw, callback) {
	console.log('authUser 호출됨 : ' + id + ', ' + pw);
	
    // CIP 컬렉션 참조
	var CIP = database.collection('CIP_user');

    // 아이디와 비밀번호를 이용해 검색
	CIP.find({"id":id, "pw":pw}).toArray(function(err, docs) {
		if (err) { // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
		
	    if (docs.length > 0) {  // 조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
	    	console.log('아이디 [%s], 패스워드 [%s] 가 일치하는 사용자 찾음.', id, pw);
	    	callback(null, docs);
	    } else {  // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
	    	console.log("일치하는 사용자를 찾지 못함.");
	    	callback(null, null);
	    }
	});
}

module.exports = router;