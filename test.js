// const spider = require("./scripts/spider.js");
// const sql = require("./scripts/sql.js");
// const middleWare = require("./scripts/middleWare.js");

// const axios = require("axios");
// async function searchQQMusic(songName) {
//     let data = null;
//     songName = encodeURIComponent(songName);
//     url = `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?w=${songName}`;
//     console.log(url);
//     await axios.get(url, {
//         headers: {
//             'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
//             'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
//         }
//     }).then(res => {
//         data = res.data;
//     })

//     return data;
// }
// searchQQMusic("ときのそら").then((res) => {
//     console.log(JSON.parse(res.slice(9, -1)).data.song.curnum);
//     console.log(JSON.parse(res.slice(9, -1)).data.song.list[0]);
// })

const Mirai = require("node-mirai-sdk");
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
    sendXML();
});

// 接受消息,发送消息(*)
bot.onMessage(async message => {
    const { type, sender, messageChain, reply, quoteReply, recall } = message;
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

function sendXML() {
    msg = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>
    <msg serviceID="146" templateID="1" action="web" brief="[分享] 芒种 - 网易云音乐" sourceMsgId="0" url="https://y.music.163.com/m/song?id=1369798757" flag="0" adverSign="0" multiMsgFlag="0">
      <item layout="2" advertiser_id="0" aid="0">
        <picture cover="http://p1.music.126.net/KFWbxh1ZLyy9WR77Ca08tA==/109951164866828786.jpg" w="0" h="0" />
        <title>芒种</title>
        <summary>音阙诗听，赵方婧 - 二十四节气</summary>
      </item>
      <source name="网易云音乐" icon="https://url.cn/55gqiDG" url="http://url.cn/5pl4kkd" action="app" a_actionData="com.netease.cloudmusic" i_actionData="tencent100495085://" appid="100495085" />
    </msg>`;
    bot.sendFriendMessage(msg, 1583925120);
}