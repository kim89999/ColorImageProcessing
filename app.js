var express = require('express');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var app = express();

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var static = require('serve-static');
var errorHandler = require('errorhandler');

// // 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');
app.use(express.static('public'));

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 몽고디비 모듈 사용
var MongoClient = require('mongodb').MongoClient;

// 데이터베이스 객체를 위한 변수 선언
var database;

// 라우터 객체 참조
var router = express.Router();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// cookie-parser 설정
app.use(cookieParser());

// routes 인스턴스
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var indexRouter = require('./routes/index');
var mongodbRouter = require('./routes/mongodb');
var signupRouter = require('./routes/signup_process');
var noticeRouter = require('./routes/notice');
var notice_addRouter = require('./routes/notice_add');
var notice_add_processRouter = require('./routes/notice_add_process');
var notice_detailRouter = require('./routes/notice_detail');

app.set('view engine', 'ejs'); //'ejs'탬플릿을 엔진으로 한다
app.set('views', path.join(__dirname, 'views')); //폴더, 폴더경로 지정

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
      '404': './404.html'
    }
   });

// 라우터 맵핑 URI
app.use('/', loginRouter);

app.use('/index', indexRouter);

app.use('/signup_process', signupRouter);

app.use('/logout', logoutRouter);

app.use('/notice', noticeRouter);

app.use('/notice_add', notice_addRouter);

app.use('/notice_add_process', notice_add_processRouter);

app.use('/notice_detail', notice_detailRouter);


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){

    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
    database = mongodbRouter.connection();

  });