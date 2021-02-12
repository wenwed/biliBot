let sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database('./database/robot.db')
console.log("Opened database successfully")

function init(db) {
    // 创建up主表
    let createUp = `CREATE TABLE IF NOT EXISTS UP
            (UID TEXT PRIMARY KEY NOT NULL,
            Name TEXT NOT NULL,
            AID TEXT NOT NULL,
            Live_Status TEXT NOT NULL,
            Dynamic_ID_Str TEXT,
            Last_Notice_Time INTEGER,
            Live_Start_Time INTEGER  NOT NULL);`;

    // 创建群关注up主表
    // Sub_Type：1为直播订阅，2为动态订阅，3为直播加动态订阅
    let createSubGroup = `CREATE TABLE IF NOT EXISTS subGroup
            (UID TEXT NOT NULL,
            Group_Number TEXT NOT NULL,
            Sub_Type INTEGER,
            PRIMARY KEY(UID,Group_Number));`;

    // 创建个人关注up主表
    let createSubPerson = `CREATE TABLE IF NOT EXISTS subPerson
            (UID TEXT NOT NULL,
            Person_Number TEXT NOT NULL,
            Sub_Type INTEGER,
            PRIMARY KEY(UID,Person_Number));`

    // 创建关键词回复表
    let createKeyWords = `CREATE TABLE IF NOT EXISTS keyWords
            (Group_Number TEXT NOT NULL,
            Key_Word TEXT NOT NULL,
            Repair_Word TEXT NOT NULL,
            Key_Type INTEGER NOT NULL,
            PRIMARY KEY(Key_Word,Group_Number));`;

    db.run(createUp);
    db.run(createSubGroup);
    db.run(createSubPerson);
    db.run(createKeyWords);

    console.log("table created successfully")
}

init(db);
db.close();