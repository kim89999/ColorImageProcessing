var express = require('express');
var router = express.Router();

// 몽고디비 모듈 사용
var MongoClient = require('mongodb').MongoClient;
var database;

//데이터베이스에 연결
function connectDB() {
    // 데이터베이스 연결 정보
    var databaseUrl = 'mongodb://localhost:27017/CIP';
    
    // 데이터베이스 연결
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) throw err;
        
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
        
        // database 변수에 할당
        database = db;
    });
    return database;
}

module.exports.connection = connectDB;