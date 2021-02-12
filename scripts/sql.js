const sqlite3 = require("sqlite3").verbose();
console.log("Opened database successfully")

let query = (sql, values) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database('./database/robot.db');
        // let db = new sqlite3.Database('./robot.db');
        var stmt = db.prepare(sql);
        stmt.all(values, (err, rows) => {
            if (err)
                reject(err);
            else {
                resolve(rows);
            }
        });
        stmt.finalize();
        db.close();
    })
}

// 创建up主表
let UP = `CREATE TABLE IF NOT EXISTS UP
    (UID TEXT PRIMARY KEY NOT NULL,
    Name TEXT NOT NULL,
    AID TEXT NOT NULL,
    Live_Status TEXT NOT NULL,
    Dynamic_ID_Str TEXT,
    Last_Notice_Time INTEGER,
    Live_Start_Time INTEGER  NOT NULL);`;

// 创建群关注up主表
// Sub_Type：1为直播订阅，2为动态订阅，3为直播加动态订阅
let subGroup = `CREATE TABLE IF NOT EXISTS subGroup
    (UID TEXT NOT NULL,
    Group_Number TEXT NOT NULL,
    Sub_Type INTEGER,
    PRIMARY KEY(UID,Group_Number));`;

// 创建个人关注up主表
let subPerson = `CREATE TABLE IF NOT EXISTS subPerson
    (UID TEXT NOT NULL,
    Person_Number TEXT NOT NULL,
    Sub_Type INTEGER,
    PRIMARY KEY(UID,Person_Number));`

// 创建关键词回复表
let keyWords = `CREATE TABLE IF NOT EXISTS keyWords
    (Group_Number TEXT NOT NULL,
    Key_Word TEXT NOT NULL,
    Repair_Word TEXT NOT NULL,
    Key_Type INTEGER NOT NULL,
    PRIMARY KEY(Key_Word,Group_Number));`;

//创建表
let createTable = (sql) => {
    return query(sql, []);
};

createTable(UP);
createTable(subGroup);
createTable(subPerson);
createTable(keyWords);

//关键词模块
//给某个群添加关键词
exports.addGroupKeyWords = (values) => {
    let _sql = `INSERT INTO keyWords (Group_Number,Key_Word,Repair_Word,Key_Type) VALUES (?,?,?,?)`;
    return query(_sql, values);
}

//查询一个群全部的精确或模糊关键词
exports.selectGroupKeyWords = (values) => {
    let _sql = "SELECT Key_Word,Repair_Word FROM keyWords WHERE Group_Number=? AND Key_Type=?;";
    return query(_sql, values);
}