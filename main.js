const Mirai = require("node-mirai-sdk");
// const { Plain, At } = Mirai.MessageComponent;
const repair = require("./scripts/repair.js");
const autoBili = require("./auto/autoBili.js");

/**
* 服务端设置(*)
* host: mirai-api-http 的地址和端口，默认是 http://127.0.0.1:8080
* authKey: mirai-api-http 的 authKey，建议手动指定
* qq: 当前 BOT 对应的 QQ 号
* enableWebsocket: 是否开启 WebSocket，需要和 mirai-api-http 的设置一致
*/
const bot = new Mirai({
    host: 'http://127.0.0.1:8080',
    authKey: '在mirai-api-http的setting.yml中自己定义的authkey',
    qq: 你的QQ号,
    enableWebsocket: false,
});

// auth 认证(*)
bot.onSignal('authed', () => {
    console.log(`Authed with session key ${bot.sessionKey}`);
    bot.verify();
});

// session 校验回调
bot.onSignal('verified', async () => {
    console.log(`Verified with session key ${bot.sessionKey}`);

    // 获取好友列表，需要等待 session 校验之后 (verified) 才能调用 SDK 中的主动接口
    const friendList = await bot.getFriendList();
    console.log(`There are ${friendList.length} friends in bot`);
    /*    自动任务    */

    // 运行bilibili爬虫
    autoBili.startBiliSpider(bot);

});

// 接受消息,发送消息(*)
bot.onMessage(async message => {
    const { type, sender, messageChain, reply, quoteReply, recall } = message;
    // repair.repairGroup(bot, message, sender, messageChain, reply, quoteReply, recall);

    // 从 messageChain 中提取文字内容
    let msg = '';
    messageChain.forEach(chain => {
        if (chain.type === 'Plain')
            msg += Plain.value(chain);
    });

});

/* 开始监听消息(*)
 * 'all' - 监听好友和群
 * 'friend' - 只监听好友
 * 'group' - 只监听群
 * 'temp' - 只监听临时会话
*/
bot.listen('all');

// 退出前向 mirai-http-api 发送释放指令(*)
process.on('exit', () => {
    bot.release();
});