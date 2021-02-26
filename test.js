const axios = require("axios");
const spider = require("./scripts/spider.js");
// 爬取动态
async function searchNewDynamic(UID) {
    let data = null;
    url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${UID}}`;
    await axios.get(url, {
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        }
    }).then(res => {
        data = res.data.data;
    })

    // 如果有cards属性的话
    if (data.cards) {
        let desc = data.cards[0].desc;
        let card = data.cards[0].card;
        let msg = spider.processDynamic(desc, card);
        console.log(msg);
    }
}
