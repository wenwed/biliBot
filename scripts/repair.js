const sql = require("./sql.js");
const middleWare = require("./middleWare.js");
const Mirai = require('node-mirai-sdk');
const { Plain, At } = Mirai.MessageComponent;

// 回复群组消息
exports.repairGroup = (message, sender, messageChain, reply, quoteReply, recall) => {
    // 从 messageChain 中提取文字内容
    let msg = '';
    messageChain.forEach(chain => {
        if (chain.type === 'Plain')
            msg += Plain.value(chain);
    });

    // 判断是否为bot指令
    if (msg.indexOf("!") === 0) {
        manageGroup(message, sender, messageChain, reply, quoteReply, recall, msg);
        return;
    }

    // 直接回复
    if (msg.includes('收到了吗'))
        reply('收到了收到了')                           // 或者: bot.reply('收到了收到了', message)
    // 引用回复
    else if (msg.includes('引用我'))
        quoteReply([At(sender.id), Plain('好的')]);     // 或者: bot.quoteReply(messageChain, message)
    // 撤回消息
    else if (msg.includes('撤回'))
        bot.recall(message);
    // 发送图片，参数接受图片路径或 Buffer
    // else if (msg.includes('来张图'))
    //     bot.sendImageMessage("./image.jpg", message);
    else if (msg.includes('wei,zaima'))
        quoteReply([At(sender.id), Plain('buzai,cnm')]);

    // 判断精确关键词
    let values = [sender.group.id, 1]
    sql.selectKeyWords(values).then(rows => {
        rows.forEach(element => {
            if (element.Key_Word === msg) {
                reply(element.Repair_Word);
            }
        });
    })

    // 判断模糊关键词
    values = [sender.group.id, 2]
    sql.selectKeyWords(values).then(rows => {
        rows.forEach(element => {
            if (msg.includes(element.Key_Word)) {
                reply(element.Repair_Word);
            }
        });
    })
}

// 回复个人消息
exports.repairPerson = (message, sender, messageChain, reply, quoteReply, recall) => {
    console.log(message);
    let msg = '';
    messageChain.forEach(chain => {
        if (chain.type === 'Plain')
            msg += Plain.value(chain);       // 从 messageChain 中提取文字内容
    });

    // 判断是否为bot指令
    if (msg.indexOf("!") === 0) {
        managePerson(message, sender, messageChain, reply, quoteReply, recall, msg);
        return;
    }
}

//处理bot的群组指令
function manageGroup(message, sender, messageChain, reply, quoteReply, recall, msg) {
    // 使用空格切割字符串
    let instruct = msg.split(" ", 2);
    let length = 0;
    let repairWord = "";

    // 消息来源群组
    let groupID = sender.group.id;
    // 发送者的权限信息 OWNER,MEMBER,ADMINISTRATOR
    let permission = sender.permission;

    let values = [];
    let type = 0;
    let UID = "";

    switch (instruct[0]) {
        case "!help":
            repairWord = `!订阅 uid\n!订阅列表\n!直播订阅 uid\n!直播订阅列表\n
!动态订阅 uid\n!动态订阅列表\n!取消订阅 uid\n!勋章查询 uid\n
需要管理员权限：\n!添加精确关键词 关键词 回复词\n!添加模糊关键词 关键词 回复词\n!删除关键词 关键词\n
!精确关键词列表\n!模糊关键词列表\n\n当前版本：2.1.0`;
            reply(repairWord);
            return;

        case "!订阅列表":
            values = [groupID, 1];
            middleWare.createGroupSubList(values).then(repairWord => {
                reply(repairWord);
            });
            return;

        case "!直播订阅列表":
            values = [groupID, 2];
            middleWare.createGroupSubList(values).then(repairWord => {
                reply(repairWord);
            });
            return;

        case "!动态订阅列表":
            values = [groupID, 3];
            middleWare.createGroupSubList(values).then(repairWord => {
                reply(repairWord);
            });
            return;

        case "!订阅":
            type = 1;
            UID = instruct[1];
            middleWare.subGroup(groupID, type, UID).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!直播订阅":
            type = 2;
            UID = instruct[1];
            middleWare.subGroup(groupID, type, UID).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!动态订阅":
            type = 3;
            UID = instruct[1];
            middleWare.subGroup(groupID, type, UID).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!取消订阅":
            UID = instruct[1];
            middleWare.deleteGroupSub(groupID, UID).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!精确关键词列表":
            if (permission !== "ADMINISTRATOR" && permission !== "OWNER") {
                reply("权限等级不足");
                return;
            }
            values = [groupID, 1];
            middleWare.createGroupKeyWordsList(values).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!模糊关键词列表":
            if (permission !== "ADMINISTRATOR" && permission !== "OWNER") {
                reply("权限等级不足");
                return;
            }
            values = [groupID, 2];
            middleWare.createGroupKeyWordsList(values).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!添加精确关键词":
            if (permission !== "ADMINISTRATOR" && permission !== "OWNER") {
                reply("权限等级不足");
                return;
            } else if (instruct.lenth === 1) {
                reply("请输入关键词");
                return;
            }
            else {
                // 判断前两个字符串加空格的长度，方便截取第三段
                length = instruct[0].length + instruct[1].length + 2;
                if (msg.substr(length) === "") {
                    reply("请输入回复词");
                    return;
                }
            }
            middleWare.addGroupKeyWords(groupID, instruct[1], 1, msg.substr(length)).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!添加模糊关键词":
            if (permission !== "ADMINISTRATOR" && permission !== "OWNER") {
                reply("权限等级不足");
                return;
            } else if (instruct.lenth === 1) {
                reply("请输入关键词");
                return;
            }
            else {
                // 判断前两个字符串加空格的长度，方便截取第三段
                length = instruct[0].length + instruct[1].length + 2;
                if (msg.substr(length) === "") {
                    reply("请输入回复词");
                    return;
                }
            }
            middleWare.addGroupKeyWords(groupID, instruct[1], 2, msg.substr(length)).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!删除关键词":
            if (permission !== "ADMINISTRATOR" && permission !== "OWNER") {
                reply("权限等级不足");
                return;
            } else if (instruct.lenth === 1) {
                reply("请输入关键词");
                return;
            }
            values = [groupID, instruct[1]];
            middleWare.deleteGroupKeyWords(values).then(repairWord => {
                reply(repairWord);
            })
            return;
    }
}

//处理bot的个人指令
function managePerson(message, sender, messageChain, reply, quoteReply, recall, msg) {
    // 使用空格切割字符串
    let instruct = msg.split(" ", 2);
    console.log(instruct[0]);

    let repairWord = "";
    let personID = sender.id;

    let values = [];
    let type = 0;
    let UID = "";

    switch (instruct[0]) {
        case "!help":
            repairWord = `!订阅 uid\n!订阅列表\n!直播订阅 uid\n!直播订阅列表\n
!动态订阅 uid\n!动态订阅列表\n!取消订阅 uid\n!勋章查询 uid\n
需要管理员权限：\n!添加精确关键词 关键词 回复词\n!添加模糊关键词 关键词 回复词\n!删除关键词 关键词\n
!精确关键词列表\n!模糊关键词列表\n\n当前版本：2.1.0`;
            reply(repairWord);
            return;

        case "!订阅列表":
            values = [personID, 1];
            middleWare.createPersonSubList(values).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!直播订阅列表":
            values = [personID, 2];
            middleWare.createPersonSubList(values).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!动态订阅列表":
            values = [personID, 3];
            middleWare.createPersonSubList(values).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!订阅":
            type = 1;
            UID = instruct[1];
            middleWare.subPerson(personID, type, UID).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!直播订阅":
            type = 2;
            UID = instruct[1];
            middleWare.subPerson(personID, type, UID).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!动态订阅":
            type = 3;
            UID = instruct[1];
            middleWare.subPerson(personID, type, UID).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!取消订阅":
            UID = instruct[1];
            middleWare.deletePersonSub(personID, UID).then(repairWord => {
                reply(repairWord);
            })
            return;
    }
}