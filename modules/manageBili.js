const sql = require("../sqlite/sql.js");
const axios = require("axios");

// 判断是否为bilibili相关指令
exports.checkBili = (bot, message, msg) => {
    // 判断是否为指令
    if (msg.indexOf("!") === 0) {

        const { sender, type, reply } = message;
        // 切割字符串
        let instruct = msg.split(" ", 2);

        switch (instruct[0]) {
            case "!订阅列表":
                createSubList(sender, type, 1).then(repairWord => {
                    reply(repairWord);
                });
                return true;

            case "!直播订阅列表":
                createSubList(sender, type, 2).then(repairWord => {
                    reply(repairWord);
                });
                return true;

            case "!动态订阅列表":
                createSubList(sender, type, 3).then(repairWord => {
                    reply(repairWord);
                });
                return true;

            case "!订阅":
                addSub(sender, type, 1, instruct[1]).then(repairWord => {
                    reply(repairWord);
                })
                return true;

            case "!直播订阅":
                addSub(sender, type, 2, instruct[1]).then(repairWord => {
                    reply(repairWord);
                })
                return true;

            case "!动态订阅":
                addSub(sender, type, 3, instruct[1]).then(repairWord => {
                    reply(repairWord);
                })
                return true;

            case "!取消订阅":
                delSub(sender, type, instruct[1]).then(repairWord => {
                    reply(repairWord);
                })
                return true;
        }
    }

    return false;
}

//生成订阅列表
function createSubList(sender, type, listType) {
    return new Promise((reslove, reject) => {
        if (type === "GroupMessage") {
            // 群组消息
            let groupID = sender.group.id;
            let values = [groupID, listType];
            createGroupSubList(values).then((res) => {
                reslove(res);
            })
        } else if (type === "FriendMessage") {
            // 个人消息
            let personID = sender.id;
            let values = [personID, listType];
            createPersonSubList(values).then((res) => {
                reslove(res);
            })
        }
    })
}

//生成群组订阅列表
async function createGroupSubList(values) {
    let repairWord = "";
    let index = 0;
    await sql.selectGroupAllSubInfoByType(values).then(rows => {
        rows.forEach(row => {
            index++;
            repairWord = repairWord + "\n" + index + "  " + row.UID + "  " + row.Name
        });
    })
    if (values[1] === 1)
        repairWord = `该群订阅了${index}位up主` + repairWord;
    else if (values[1] === 2)
        repairWord = `该群直播订阅了${index}位up主` + repairWord;
    else if (values[1] === 3)
        repairWord = `该群动态订阅了${index}位up主` + repairWord;
    return repairWord;
}

//生成个人订阅列表
async function createPersonSubList(values) {
    let repairWord = "";
    let index = 0;
    await sql.selectPersonAllSubInfoByType(values).then(rows => {
        rows.forEach(row => {
            index++;
            repairWord = repairWord + "\n" + index + "  " + row.UID + "  " + row.Name
        });
    })
    if (values[1] === 1)
        repairWord = `你订阅了${index}位up主` + repairWord;
    else if (values[1] === 2)
        repairWord = `你直播订阅了${index}位up主` + repairWord;
    else if (values[1] === 3)
        repairWord = `你动态订阅了${index}位up主` + repairWord;
    return repairWord;
}

// 添加订阅
function addSub(sender, type, UID) {
    return new Promise((reslove, reject) => {
        if (type === "GroupMessage") {
            // 群组消息
            let groupID = sender.group.id;
            let values = [groupID, subType, UID];
            addGroupSub(values).then((repairWord) => {
                reslove(repairWord);
            })

        } else if (type === "FriendMessage") {
            // 个人消息
            let personID = sender.id;
            let values = [personID, subType, UID];
            addPersonSub(values).then((repairWord) => {
                reslove(repairWord);
            })
        }
    })
}

//为群组订阅一位UP主
async function addGroupSub(groupID, type, UID) {
    // 判断用户输入的UID是不是数字
    if (isNaN(UID))
        return "UID应为数字";

    let repairWord = "";
    let UPName = "";
    let infoData = null;
    //判断该群组是否正在关注此UP主
    let values = [UID, groupID];
    await sql.selectGroupOneSub(values).then(rows => {
        if (rows.length === 1) {
            UPName = rows[0].Name;
            if (rows[0].Sub_Type === type) {
                repairWord = `该群已订阅${UPName}`;
                throw new Error("STOP");
            }
            else {
                values = [type, UID, groupID];
                sql.updateGroupSubType(values);
                repairWord = `已更新${UPName}的订阅类型`;
                throw new Error("STOP");
            }
        } else {
            values = [UID];
            return sql.selectUP(values);
        }
    }).then(rows => {
        if (rows.length === 1) {
            UPName = rows[0].Name;
            values = [UID, groupID, type]
            sql.addGroupSub(values);
            repairWord = `关注${UPName}成功`;
            throw new Error("STOP");
        } else {
            let infoURL = `https://api.bilibili.com/x/space/acc/info?mid=${UID}&jsonp=jsonp`;
            return axios.get(infoURL, {
                headers: {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
                }
            })
        }
    }).then((res) => {
        infoData = res.data;
        if (infoData.code !== 0) {
            repairWord = "爬取信息出错，请检查UID是否正确";
            throw new Error("STOP");
        } else {
            // 向数据库中新增UP主信息
            infoData = infoData.data;
            let Name = infoData.name;
            let AID = null;
            if (infoData.live_room.roomStatus === 1)
                AID = infoData.live_room.roomid;
            let liveStatus = infoData.live_room.liveStatus;
            let liveStartTime = Math.round(new Date().getTime() / 1000);
            let lastNoticeTime = Math.round(new Date().getTime() / 1000);
            values = [UID, Name, AID, liveStatus, liveStartTime, lastNoticeTime]
            sql.addUP(values);

            // 向数据库中新增关注
            values = [UID, groupID, type];
            sql.addGroupSub(values);
            repairWord = `订阅${Name}成功`
        }
    }).catch(() => {
        // 之前throw的"STOP" error会直接跳转到这里
        if (repairWord === "")
            repairWord = "未知错误";
    })
    return repairWord;
}

//为个人订阅一位UP主
async function addPersonSub(personID, type, UID) {
    // 判断用户输入的UID是不是数字
    if (isNaN(UID))
        return "UID应为数字";

    let repairWord = "";
    let UPName = "";
    let infoData = null;
    //判断该群组是否正在关注此UP主
    let values = [UID, personID];
    await sql.selectPersonOneSub(values).then(rows => {
        if (rows.length === 1) {
            UPName = rows[0].Name;
            if (rows[0].Sub_Type === type) {
                repairWord = `你已订阅${UPName}`;
                throw new Error("STOP");
            }
            else {
                values = [type, UID, personID];
                sql.updatePersonSubType(values);
                repairWord = `已更新${UPName}的关注类型`;
                throw new Error("STOP");
            }
        } else {
            values = [UID];
            return sql.selectUP(values);
        }
    }).then(rows => {
        if (rows.length === 1) {
            UPName = rows[0].Name;
            values = [UID, personID, type]
            sql.addPersonSub(values);
            repairWord = `订阅${UPName}成功`;
            throw new Error("STOP");
        } else {
            let infoURL = `https://api.bilibili.com/x/space/acc/info?mid=${UID}&jsonp=jsonp`;
            return axios.get(infoURL, {
                headers: {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
                }
            })
        }
    }).then((res) => {
        infoData = res.data;
        if (infoData.code !== 0) {
            repairWord = "爬取信息出错，请检查UID是否正确";
            throw new Error("STOP");
        } else {
            // 向数据库中新增UP主信息
            infoData = infoData.data;
            let Name = infoData.name;
            let AID = null;
            if (infoData.live_room.roomStatus === 1)
                AID = infoData.live_room.roomid;
            let liveStatus = infoData.live_room.liveStatus;
            let liveStartTime = Math.round(new Date().getTime() / 1000);
            let lastNoticeTime = Math.round(new Date().getTime() / 1000);
            values = [UID, Name, AID, liveStatus, liveStartTime, lastNoticeTime]
            sql.addUP(values);

            // 向数据库中新增关注
            values = [UID, personID, type];
            sql.addPersonSub(values);
            repairWord = `订阅${Name}成功`
        }
    }).catch((err) => {
        // 之前throw的"STOP" error会直接跳转到这里
        if (repairWord === "")
            repairWord = "未知错误";
    })
    return repairWord;
}

// 删除对某个UP主的订阅
function delSub(sender, type, UID) {
    return new Promise((reslove, reject) => {
        if (type === "GroupMessage") {
            // 群组消息
            let groupID = sender.group.id;
            let values = [groupID, UID];
            deleteGroupSub(values).then((repairWord) => {
                reslove(repairWord);
            })
        } else if (type === "FriendMessage") {
            // 个人消息
            let personID = sender.id;
            let values = [personID, UID];
            deletePersonSub(values).then((repairWord) => {
                reslove(repairWord);
            })
        }
    })
}

// 删除某个群组对某个UP主的订阅
async function deleteGroupSub(groupID, UID) {
    // 判断用户输入的UID是不是数字
    if (isNaN(UID))
        return "UID应为数字";

    let repairWord = "";
    let UPName = "";
    let values = [UID, groupID];
    let subNum = 0;

    // 先判断是否订阅
    await sql.selectGroupOneSub(values).then(rows => {
        if (rows.length === 0) {
            repairWord = `该群未订阅此UP主`;
            throw new Error("STOP");
        } else {
            UPName = rows[0].Name;
            return sql.deleteGroupSub(values);
        }
    }).then(() => {
        // 查找个人关注的数量
        values = [UID];
        return sql.selectPersonSubByUP(values);
    }).then(rows => {
        // 查找群组关注的数量
        subNum += rows.length;
        return sql.selectGroupSubByUP(values);
    }).then(rows => {
        subNum += rows.length;
        if (subNum !== 0) {
            repairWord = `取消订阅${UPName}成功`;
            throw new Error("STOP");
        } else {
            return sql.deleteUP(values);
        }
    }).then(() => {
        repairWord = `取消订阅${UPName}成功`;
    }).catch(err => {
        // 之前throw的"STOP" error会直接跳转到这里
        if (repairWord === "")
            repairWord = "未知错误";
    })
    return repairWord;
}

// 删除某个个人对某个UP主的订阅
async function deletePersonSub(personID, UID) {
    // 判断用户输入的UID是不是数字
    if (isNaN(UID))
        return "UID应为数字";

    let repairWord = "";
    let UPName = "";
    let values = [UID, personID];
    let subNum = 0;

    // 先判断是否订阅
    await sql.selectPersonOneSub(values).then(rows => {
        if (rows.length === 0) {
            repairWord = `你未订阅此UP主`;
            throw new Error("STOP");
        } else {
            UPName = rows[0].Name;
            return sql.deletePersonSub(values);
        }
    }).then(() => {
        // 查找个人关注的数量
        values = [UID];
        return sql.selectPersonSubByUP(values);
    }).then(rows => {
        // 查找群组关注的数量
        subNum += rows.length;
        return sql.selectGroupSubByUP(values);
    }).then(rows => {
        subNum += rows.length;
        if (subNum !== 0) {
            repairWord = `取消订阅${UPName}成功`;
            throw new Error("STOP");
        } else {
            return sql.deleteUP(values);
        }
    }).then(() => {
        repairWord = `取消订阅${UPName}成功`;
    }).catch(err => {
        // 之前throw的"STOP" error会直接跳转到这里
        if (repairWord === "")
            repairWord = "未知错误";
    })
    return repairWord;
}