const sqlite3 = require("sqlite3").verbose();
console.log("Opened database successfully")

let query = (sql, values) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database('./database/robot.db');
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
    AID TEXT,
    Live_Status TEXT NOT NULL,
    Last_Notice_Time INTEGER,
    Live_Start_Time INTEGER  NOT NULL);`;

// 创建群关注up主表
// Sub_Type：1为直播&动态订阅，2为直播订阅，3为动态订阅
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
exports.selectOneKeyWords = (values) => {
    let _sql = `SELECT * FROM keyWords WHERE Group_Number=? AND Key_Word=?;`;
    return query(_sql, values);
}

// 查询一个群全部的精确或模糊关键词
exports.selectKeyWords = (values) => {
    let _sql = `SELECT Key_Word, Repair_Word FROM keyWords WHERE Group_Number=? AND Key_Type=?;`;
    return query(_sql, values);
}

// 更新某个群的某个关键词的类型
exports.updateKeyWords = (values) => {
    let _sql = `UPDATE keyWords SET Key_Type=? WHERE Group_Number=? AND Key_Word=?;`;
    return query(_sql, values);
}

// 删除某个群的某个关键词
exports.deleteKeyWords = (values) => {
    let _sql = `DELETE FROM keyWords WHERE Group_Number=? AND Key_Word=?;`;
    return query(_sql, values);
}

// UP模块
// 添加一个UP主
exports.addUP = (values) => {
    let _sql = `INSERT INTO UP (UID,Name,AID,Live_Status,Live_Start_Time,Last_Notice_Time) VALUES (?,?,?,?,?,?);`;
    return query(_sql, values);
}

// 根据ID查询某个UP主的信息
exports.selectUP = (values) => {
    let _sql = `SELECT * FROM UP WHERE UID=?;`;
    return query(_sql, values);
}

// 根据ID修改某个UP主的全部信息
exports.updateUP = (values) => {
    let _sql = `UPDATE UP SET Name=?,AID=?,Live_Status=?,Dynamic_ID_Str=?,Live_Start_Time=?,Last_Notice_Time=? WHERE UID=?;`;
    return query(_sql, values);
}

// 根据ID修改上一次爬取某个UP主动态的时间
exports.updateUPNoticeTime = (values) => {
    let _sql = `UPDATE UP SET Last_Notice_Time=? WHERE UID=?;`;
    return query(_sql, values);
}

// 根据ID修改上一次某个UP主开始直播的时间
exports.updateUPLiveTime = (values) => {
    let _sql = `UPDATE UP SET Live_Start_Time=? WHERE UID=?;`;
    return query(_sql, values);
}

//删除某个UP主
exports.deleteUP = (values) => {
    let _sql = `DELETE FROM UP WHERE UID=?;`;
    return query(_sql, values);
}

// 个人关注模块
// 添加个人关注
exports.addPersonSub = (values) => {
    let _sql = `INSERT INTO subPerson (UID, Person_Number,Sub_Type) VALUES (?,?,?);`;
    return query(_sql, values);
}

// 查询某个个人对某个UP主的关注
exports.selectPersonOneSub = (values) => {
    let _sql = `SELECT subPerson.Sub_Type,UP.Name FROM subPerson,UP 
        WHERE subPerson.UID=? AND subPerson.UID=UP.UID AND Person_Number=?;`;
    return query(_sql, values);
}

// 查询某个人的全部关注
exports.selectPersonAllSub = (values) => {
    let _sql = `SELECT * FROM subPerson WHERE UID=? AND Person_Number=?;`;
    return query(_sql, values);
}

// 查询某个群组的全部关注并获取UP主信息
exports.selectPersonAllSubInfoByType = (values) => {
    let _sql = `SELECT UP.UID,UP.Name FROM Person,UP 
            WHERE subPerson.Person_Number=? AND subPerson.UID=UP.UID AND Sub_Type=?;`;
    return query(_sql, values);
}

// 查询某个群组的全部直播或动态的关注
exports.selectPersonSubByType = (values) => {
    let _sql = `SELECT * FROM subPerson WHERE UID=? AND Person_Number=? AND Sub_Type=?;`;
    return query(_sql, values);
}

// 查询某个人的全部直播或动态的关注
exports.selectPersonSubByType = (values) => {
    let _sql = `SELECT * FROM subPerson WHERE UID=? AND Person_Number=? AND Sub_Type=?;`;
    return query(_sql, values);
}

// 修改某个人对某个UP的关注种类
exports.updatePersonSubType = (values) => {
    let _sql = `UPDATE subPerson SET Sub_Type=? WHERE UID=? AND Person_Number=?;`;
    return query(_sql, values);
}

// 删除某个人对某个UP的关注
exports.deletePersonSub = (values) => {
    let _sql = `DELETE FROM subPerson WHERE UID=? AND Person_Number=?;`;
    return query(_sql, values);
}

// 群组关注模块
// 添加群组关注
exports.addGroupSub = (values) => {
    let _sql = `INSERT INTO subGroup (UID, Group_Number,Sub_Type) VALUES (?,?,?);`;
    return query(_sql, values);
}

// 查询某个群组对某个UP主的关注
exports.selectGroupOneSub = (values) => {
    let _sql = `SELECT subGroup.Sub_Type,UP.Name FROM subGroup,UP 
        WHERE subGroup.UID=? AND subGroup.UID=UP.UID AND Group_Number=?;`;
    return query(_sql, values);
}

// 查询某个群组的全部关注
exports.selectGroupAllSub = (values) => {
    let _sql = `SELECT * FROM subGroup WHERE Group_Number=?;`;
    return query(_sql, values);
}

// 查询某个群组的全部关注并获取UP主信息
exports.selectGroupAllSubInfoByType = (values) => {
    let _sql = `SELECT UP.UID,UP.Name FROM subGroup,UP 
            WHERE subGroup.Group_Number=? AND subGroup.UID=UP.UID AND Sub_Type=?;`;
    return query(_sql, values);
}

// 查询某个群组的全部直播或动态的关注
exports.selectGroupSubByType = (values) => {
    let _sql = `SELECT * FROM subGroup WHERE UID=? AND Group_Number=? AND Sub_Type=?;`;
    return query(_sql, values);
}

// 修改某个群组对某个UP的关注种类
exports.updateGroupSubType = (values) => {
    let _sql = `UPDATE subGroup SET Sub_Type=? WHERE UID=? AND Group_Number=?;`;
    return query(_sql, values);
}

// 删除某个群组对某个UP的关注
exports.deleteGroupSub = (values) => {
    let _sql = `DELETE FROM subGroup WHERE UID=? AND Group_Number=?;`;
    return query(_sql, values);
}

// 其它模块
// 查询某个UP主是否有关注的人
exports.selectPersonSubByUP = (values) => {
    let _sql = `select * FROM subGroup WHERE UID=?;`;
    return query(_sql, values);
}

// 查询某个UP主是否有关注的群组
exports.selectGroupSubByUP = (values) => {
    let _sql = `select * FROM subGroup WHERE UID=?;`;
    return query(_sql, values);
}