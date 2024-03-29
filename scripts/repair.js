const sql = require("./sql.js");
const middleWare = require("./middleWare.js");
const spider = require("./spider.js");
const Mirai = require('node-mirai-sdk');
const { Plain, At } = Mirai.MessageComponent;

// 开始运行bilibili爬虫
exports.startBiliSpider = async (bot) => {
    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    //更新UP主的动态时间
    spider.resetDynamicTime();
    // 五分钟运行一次爬虫
    while (true) {
        await sleep(300000).then(() => {
            spider.startLivingSpider(bot);
            spider.startDynamicSpider(bot);
        })
    }
}

// 回复群组消息
exports.repairGroup = async (bot, message, sender, messageChain, reply, quoteReply, recall) => {
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

    manageTodo(sender, reply, msg);

    let target = 0;
    messageChain.forEach(chain => {
        if (chain.type === 'At') {
            target = chain.target;
        }
    });

    // 群组聊天@了bot
    if (target === bot.qq) {
        if (msg === " " || msg === "") {
            sql.selectAllAtWords().then((rows) => {
                let len = rows.length;
                let ran = Math.floor(Math.random() * len);
                reply(rows[ran]["At_Word"]);
                return;
            })
        } else if (msg === "老婆" || msg === " 老婆") {
            bot.sendImageMessage("./images/feizhai.jpg", message);
            return;
        } else {
            bot.sendImageMessage("./images/ybb.jpg", message);
            return;
        }
    }

    // else if (msg.includes('引用我'))
    //     quoteReply([At(sender.id), Plain('好的')]);     // 或者: bot.quoteReply(messageChain, message)

    // 判断精确关键词
    let values = [sender.group.id, 1]
    sql.selectKeyWords(values).then(rows => {
        rows.forEach(element => {
            if (element.Key_Word === msg) {
                reply(element.Repair_Word);
                flag = true;
                return;
            }
        });
    })

    // 判断模糊关键词
    values = [sender.group.id, 2]
    sql.selectKeyWords(values).then(rows => {
        for (let i = 0; i < rows.length; i++) {
            if (msg.includes(rows[i].Key_Word)) {
                reply(rows[i].Repair_Word);
                return;
            }
        }
    })

    // 复读
    values = [sender.group.id]
    sql.selectGroupBanRepeat(values).then((rows) => {
        if (rows.length === 0) {
            // 复读模块
            let ran = Math.floor(Math.random() * 80);
            if (ran === 1) {
                let repeatWord = msg.replace(/你/g, "他").replace(/我/g, "你").replace(/bot/g, "我");
                reply(repeatWord);
                return;
            }
        }
    })
}

// 回复个人消息
exports.repairPerson = (bot, message, sender, messageChain, reply, quoteReply, recall) => {
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
            repairWord = `!订阅 uid\n!订阅列表\n!直播订阅 uid\n!直播订阅列表
!动态订阅 uid\n!动态订阅列表\n!取消订阅 uid
todo 内容\ntodolist\ndeltodo id\ndelalltodo
需要管理员权限：\n!添加精确关键词 关键词 回复词\n!添加模糊关键词 关键词 回复词\n!删除关键词 关键词
!精确关键词列表\n!模糊关键词列表\n!开启复读\n!关闭复读
当前版本：3.0.0\ngithub地址：https://github.com/wenwed/biliBot`;
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
            } else {
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
            } else {
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

        case "!开启复读":
            if (permission !== "ADMINISTRATOR" && permission !== "OWNER") {
                reply("权限等级不足");
                return;
            }
            values = [groupID];
            middleWare.startRepeat(values).then(repairWord => {
                reply(repairWord);
            })
            return;

        case "!关闭复读":
            if (permission !== "ADMINISTRATOR" && permission !== "OWNER") {
                reply("权限等级不足");
                return;
            }
            values = [groupID];
            middleWare.stopRepeat(values).then(repairWord => {
                reply(repairWord);
            })
            return;
    }
}

//处理bot的个人指令
function managePerson(message, sender, messageChain, reply, quoteReply, recall, msg) {
    // 使用空格切割字符串
    let instruct = msg.split(" ", 2);

    let repairWord = "";
    let personID = sender.id;

    let values = [];
    let type = 0;
    let UID = "";

    switch (instruct[0]) {
        case "!help":
            repairWord = `!订阅 uid\n!订阅列表\n!直播订阅 uid\n!直播订阅列表\n
!动态订阅 uid\n!动态订阅列表\n!取消订阅 uid\n!勋章查询 uid
当前版本：3.0.0\ngithub地址：https://github.com/wenwed/biliBot`;
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

        case "!勋章查询":
            reply("API已失效");
            // UID = instruct[1];
            // middleWare.searchBiliMedal(UID).then(repairWord => {
            //     reply(repairWord);
            // })
            return;
    }
}

function manageTodo(sender, reply, msg) {
    // 使用空格切割字符串
    let instruct = msg.split(" ", 2);
    let order = instruct[0].toLowerCase();
    // 消息来源群组
    let groupID = sender.group.id;
    let permission = sender.permission;

    switch (order) {
        case "todo": {
            middleWare.createTodo(msg.substring(instruct[0].length + 1), groupID).then((repairWord) => {
                reply(repairWord);
            })
            return;
        }
        case "deltodo": {
            middleWare.completeTodo(groupID, instruct[1]).then((repairWord) => {
                reply(repairWord);
            })
            return;
        }
        case "todolist": {
            middleWare.selectGroupTodo(groupID).then((repairWord) => {
                reply(repairWord);
            })
            return;
        }
        case "delalltodo": {
            if (permission !== "ADMINISTRATOR" && permission !== "OWNER") {
                reply("权限等级不足");
                return;
            }
            middleWare.completeAllTodo(groupID).then((repairWord) => {
                reply(repairWord);
            })
            return;
        }
    }
}