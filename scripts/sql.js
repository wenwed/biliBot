const sqlite3 = require("sqlite3").verbose();
console.log("Opened database successfully")

// 创建一个执行sql语句的promise函数
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

// 创建群组@回复词表
let atWords = `CREATE TABLE IF NOT EXISTS atWords
    (atWordID INTEGER PRIMARY KEY AUTOINCREMENT,
    At_Word TEXT NOT NULL);`;

// 创建ban复读群组表
let repeatBan = `CREATE TABLE IF NOT EXISTS repeatBan
    (Group_Number INTEGER PRIMARY KEY);`;

// 创建todolist表
let todos = `CREATE TABLE IF NOT EXISTS todos
    (todoID INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_text TEXT NOT NULL,
    Group_Number TEXT NOT NULL,
    todo_time INTEGER);`;

// 创建表
let createTable = (sql) => {
    return query(sql, []);
};

createTable(UP);
createTable(subGroup);
createTable(subPerson);
createTable(keyWords);
createTable(atWords);
createTable(repeatBan);
createTable(todos);

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

// 重置所有UP主的爬取动态时间
exports.updateAllUPNoticeTime = (values) => {
    let _sql = `UPDATE UP SET Last_Notice_Time=?;`;
    return query(_sql, values);
}

// 根据AID修改上一次某个UP主开始直播的时间
exports.updateUPLiveTime = (values) => {
    let _sql = `UPDATE UP SET Live_Start_Time=? WHERE AID=?;`;
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
    let _sql = `SELECT UP.UID,UP.Name FROM subPerson,UP 
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


// bilbili爬虫模块
// 查询群组关注中需要爬取的房间
exports.selectGroupRoomTospider = (values) => {
    let _sql = "SELECT AID,Live_Start_Time FROM UP,subGroup WHERE subGroup.UID=UP.UID AND subGroup.Sub_Type=?;";
    return query(_sql, values);
}

// 查询个人关注中需要爬取的房间
exports.selectPersonRoomTospider = (values) => {
    let _sql = "SELECT AID,Live_Start_Time FROM UP,subPerson WHERE subPerson.UID=UP.UID AND subPerson.Sub_Type=?;";
    return query(_sql, values);
}

// 根据房间号和类型查找订阅的群组
exports.selectGroupByAID = (values) => {
    let _sql = "SELECT Group_Number FROM subGroup,UP WHERE UP.UID=subGroup.UID AND UP.AID=? AND subGroup.Sub_Type=?;";
    return query(_sql, values);
}

// 根据房间号和类型查找订阅的个人
exports.selectPersonByAID = (values) => {
    let _sql = "SELECT Person_Number FROM subPerson,UP WHERE UP.UID=subPerson.UID AND UP.AID=? AND subPerson.Sub_Type=?;";
    return query(_sql, values);
}

// 查询群组关注中需要爬取动态的UP主
exports.selectGroupDynamicTospider = (values) => {
    let _sql = "SELECT UP.UID,Last_Notice_Time FROM UP,subGroup WHERE subGroup.UID=UP.UID AND subGroup.Sub_Type=?;";
    return query(_sql, values);
}

// 查询个人关注中需要爬取动态的UP主
exports.selectPersonDynamicTospider = (values) => {
    let _sql = "SELECT UP.UID,Last_Notice_Time FROM UP,subPerson WHERE subPerson.UID=UP.UID AND subPerson.Sub_Type=?;";
    return query(_sql, values);
}

// 根据UID和类型查找订阅的群组
exports.selectGroupByUID = (values) => {
    let _sql = "SELECT Group_Number FROM subGroup,UP WHERE UP.UID=subGroup.UID AND UP.UID=? AND subGroup.Sub_Type=?;";
    return query(_sql, values);
}

// 根据房间号和类型查找订阅的个人
exports.selectPersonByUID = (values) => {
    let _sql = "SELECT Person_Number FROM subPerson,UP WHERE UP.UID=subPerson.UID AND UP.UID=? AND subPerson.Sub_Type=?;";
    return query(_sql, values);
}


// @bot回复词模块
// 添加@bot后的回复词
exports.addAtWords = (values) => {
    let _sql = `INSERT INTO atWords (At_Word) VALUES (?);`;
    return query(_sql, values);
}

// 查询全部的@bot回复词
exports.selectAllAtWords = (values) => {
    let _sql = `SELECT * FROM atWords;`;
    return query(_sql, values);
}


// 复读模块
// 添加群组复读
exports.addGroupBanRepeat = (values) => {
    let _sql = `INSERT INTO repeatBan (Group_Number) VALUES (?);`;
    return query(_sql, values);
}

// 查询某个群组是否关闭复读
exports.selectGroupBanRepeat = (values) => {
    let _sql = `SELECT * FROM repeatBan WHERE Group_Number=?;`;
    return query(_sql, values);
}

// 删除群组复读
exports.deleteGroupBanRepeat = (values) => {
    let _sql = `DELETE FROM repeatBan WHERE Group_Number=?;`;
    return query(_sql, values);
}


// 其它模块
// 查询某个UP主是否有关注的人
exports.selectPersonSubByUP = (values) => {
    let _sql = `select * FROM subPerson WHERE UID=?;`;
    return query(_sql, values);
}

// 查询某个UP主是否有关注的群组
exports.selectGroupSubByUP = (values) => {
    let _sql = `select * FROM subGroup WHERE UID=?;`;
    return query(_sql, values);
}

// todo模块
// 添加todo
exports.addTodo = (values) => {
    const _sql = `INSERT INTO todos (todo_text, Group_Number, todo_time) VALUES (?,?,?)`;
    return query(_sql, values);
}

// 查询某个todo
exports.selectOneTodo = (values) => {
    const _sql = `SELECT * FROM todos WHERE todoID=?;`;
    return query(_sql, values)
}

// 查询todo
exports.selectTodo = (values) => {
    const _sql = `SELECT * FROM todos WHERE Group_Number=? ORDER BY todo_time;`;
    return query(_sql, values);
}

// 分页查询todo
exports.selectLimitTodo = (values) => {
    const _sql = `SELECT * FROM todos WHERE Group_Number=? ORDER BY todo_time LIMIT ?, ?;`;
    return query(_sql, values);
}

// 完成todo
exports.deleteTodo = (values) => {
    const _sql = `DELETE FROM todos WHERE todoID=?;`;
    return query(_sql, values);
}

// 完成所有的todo
exports.deleteAllTodo = (values) => {
    const _sql = `DELETE FROM todos WHERE Group_Number=?;`;
    return query(_sql, values);
}