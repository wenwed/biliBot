const sql = require("./scripts/sql.js");
const Mirai = require('node-mirai-sdk');
const { Plain, At } = Mirai.MessageComponent;

// 回复群组消息
exports.repairGroup = (sender, messageChain, reply, quoteReply) => {

    let msg = '';
    messageChain.forEach(chain => {
        if (chain.type === 'Plain')
            msg += Plain.value(chain);       // 从 messageChain 中提取文字内容
    });
    if (msg.indexOf("!") === 1) {
        let repairMsg = manageGroup(msg);
        reply(repairMsg);
    }

    // 直接回复
    if (msg.includes('收到了吗'))
        reply('收到了收到了');                          // 或者: bot.reply('收到了收到了', message)
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

    let values = [sender.group.id, 1]
    sql.selectGroupKeyWords(values).then((res) => {
        res.forEach(element => {
            if (element.Key_Word === msg) {
                reply(element.Repair_Word);
            }
        });
    })

    values = [sender.group.id, 2]
    sql.selectGroupKeyWords(values).then((res) => {
        res.forEach(element => {
            if (msg.includes(element.Key_Word)) {
                reply(element.Repair_Word);
            }
        });
    })
}

// 回复个人消息
exports.repairPerson = (sender, messageChain, reply, quoteReply) => {
    let msg = '';
    messageChain.forEach(chain => {
        if (chain.type === 'Plain')
            msg += Plain.value(chain);       // 从 messageChain 中提取文字内容
    });
}

function manageGroup(msg) {
    let instruct = msg.split(" ", 2);
    switch (instruct[0]) {
        case "!help":
            return `!订阅 uid\n!订阅列表\n!直播订阅 uid\n!直播订阅列表\n
            !动态订阅 uid\n!动态订阅列表\n!取消订阅 uid\n!勋章查询 uid\n\n
            管理员权限：\n" + "!添加精确关键词 关键词 回复词\n!添加模糊关键词 关键词 回复词\n!删除关键词 关键词\n
            !精确关键词列表\n!模糊关键词列表\n\n当前版本：2.1.0`
        case "!订阅列表":
            sql.selectGroupAllSub
    }
}