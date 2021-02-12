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

// 创建表
let createTable = (sql) => {
    return query(sql, []);
};

createTable(UP);
createTable(subGroup);
createTable(subPerson);
createTable(keyWords);

// 关键词模块
// 给某个群添加关键词
exports.addKeyWords = (values) => {
    let _sql = `INSERT INTO keyWords (Group_Number,Key_Word,Repair_Word,Key_Type) VALUES (?,?,?,?)`;
    return query(_sql, values);
}

// 查询某个群是否有某个关键词
exports.selectExistKeyWords = (values) => {
    let _sql = "SELECT * FROM keyWords WHERE Group_Number=? AND Key_Word=?;";
    return query(_sql, values);
}

// 更新某个群的某个关键词的类型
exports.updateKeyWords = (values) => {
    let _sql = "UPDATE keyWords SET Key_Type=? WHERE Group_Number=? AND Key_Word=?;";
    return query(_sql, values);
}

// 查询一个群全部的精确或模糊关键词
exports.selectKeyWords = (values) => {
    let _sql = "SELECT Key_Word, Repair_Word FROM keyWords WHERE Group_Number=? AND Key_Type=?;";
    return query(_sql, values);
}

// 删除某个群的某个关键词
exports.deleteKeyWords = (values) => {
    let _sql = "DELETE FROM keyWords WHERE Group_Number=? AND Key_Word=?;";
    return query(_sql, values);
}

// UP模块
// 添加一个UP主
exports.addUP = (values) => {
    let _sql = "INSERT INTO UP (UID,Name,AID,Live_Status,Live_Start_Time,Last_Notice_Time) VALUES (?,?,?,?,?,?);";
    return query(_sql, values);
}

// 根据ID查询某个UP主的信息
exports.selectUPByID = (values) => {
    let _sql = "SELECT * FROM UP WHERE UID=?;";
    return query(_sql, values);
}

// 根据ID修改某个UP主的信息
exports.updateUPByID = (values) => {
    let _sql = `UPDATE UP SET Key_Type=?,Name=?,AID=?,Live_Status=?,Live_Start_Time=?,Last_Notice_Time=? WHERE UID=?;`;
    return query(_sql, values);
}

//删除某个UP主
exports.deleteUP = (values) => {
    let _sql = "DELETE FROM UP WHERE UID=?;";
    return query(_sql, values);
}