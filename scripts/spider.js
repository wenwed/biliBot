const sql = require("./sql.js");
const axios = require("axios");

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

// 直播间爬虫模块
//启动前重置动态爬取时间防止刷屏
exports.resetDynamicTime = () => {
    let values = [Math.round(new Date().getTime() / 1000)];
    sql.updateAllUPNoticeTime(values);
}

// 开始运行直播爬虫
exports.startLivingSpider = async (bot) => {
    let rooms = {};

    //查询群组的全部订阅房间
    let values = [1];
    await sql.selectGroupRoomTospider(values).then(rows => {
        rows.forEach(row => {
            rooms[row.AID] = row.Live_Start_Time;
        });
    })
    //查询群组的直播订阅房间
    values = [2];
    await sql.selectGroupRoomTospider(values).then(rows => {
        rows.forEach(row => {
            rooms[row.AID] = row.Live_Start_Time;
        });
    })
    //查询个人的全部订阅房间
    values = [1];
    await sql.selectPersonRoomTospider(values).then(rows => {
        rows.forEach(row => {
            rooms[row.AID] = row.Live_Start_Time;
        });
    })
    //查询个人的直播订阅房间
    values = [2];
    await sql.selectPersonRoomTospider(values).then(rows => {
        rows.forEach(row => {
            rooms[row.AID] = row.Live_Start_Time;
        });
    })

    //开始爬取房间
    searchLivingRooms(bot, rooms);
}

async function searchLivingRooms(bot, rooms) {
    for (let AID in rooms) {
        // 每隔三秒爬取一次防止被限制
        await sleep(3000).then(() => {
            searchLivingRoom(bot, AID, rooms[AID]);
        })
    };
}

// 爬取直播间状态
async function searchLivingRoom(bot, AID, lastStartTime) {
    let data = null;
    url = `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${AID}`;
    await axios.get(url, {
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        }
    }).then(res => {
        data = res.data;
    })
    // 房间号错误直接返回
    if (data.code === -400) return;

    data = data.data;
    let live_status = data.room_info.live_status;
    let start_time = data.room_info.live_start_time;
    //正在直播且之前未查询过
    if (live_status === 1 && start_time !== lastStartTime) {
        let values = [start_time, AID];
        // 更新直播开始时间
        sql.updateUPLiveTime(values);
        // 根据不同的订阅类型发送消息
        values = [AID, 1];
        sql.selectGroupByAID(values).then(rows => {
            rows.forEach(row => {
                handleGroupLiving(bot, data, row.Group_Number);
            });
        })
        values = [AID, 2];
        sql.selectGroupByAID(values).then(rows => {
            rows.forEach(row => {
                handleGroupLiving(bot, data, row.Group_Number);
            });
        })
        values = [AID, 1];
        sql.selectPersonByAID(values).then(rows => {
            rows.forEach(row => {
                handlePersonLiving(bot, data, row.Person_Number);
            });
        })
        values = [AID, 2];
        sql.selectPersonByAID(values).then(rows => {
            rows.forEach(row => {
                handlePersonLiving(bot, data, row.Person_Number);
            });
        })
    }
}

// 发送群组消息
function handleGroupLiving(bot, data, groupID) {
    try {
        let room = data.room_info;
        let UP = data.anchor_info.base_info.uname;
        let msg = `你关注的${UP}开播啦！${room.title}，地址：https://live.bilibili.com/${room.room_id}`;
        bot.sendGroupMessage(msg, groupID);
    } catch (error) {
    }
}

//发送个人消息
function handlePersonLiving(bot, data, PersonID) {
    try {
        let room = data.room_info;
        let UP = data.anchor_info.base_info.uname;
        let msg = `你关注的${UP}开播啦！${room.title}，地址：https://live.bilibili.com/${room.room_id}`;
        bot.sendFriendMessage(msg, PersonID);
    } catch (error) {
    }
}

// 动态爬虫模块
// 开始运行动态爬虫
exports.startDynamicSpider = async (bot) => {
    let UPS = {};

    //查询群组的全部订阅
    let values = [1];
    await sql.selectGroupDynamicTospider(values).then(rows => {
        rows.forEach(row => {
            UPS[row.UID] = row.Last_Notice_Time;
        });
    })
    //查询群组的订阅动态
    values = [3];
    await sql.selectGroupDynamicTospider(values).then(rows => {
        rows.forEach(row => {
            UPS[row.UID] = row.Last_Notice_Time;
        });
    })
    //查询个人的全部订阅
    values = [1];
    await sql.selectPersonDynamicTospider(values).then(rows => {
        rows.forEach(row => {
            UPS[row.UID] = row.Last_Notice_Time;
        });
    })
    //查询个人的动态订阅
    values = [3];
    await sql.selectPersonDynamicTospider(values).then(rows => {
        rows.forEach(row => {
            UPS[row.UID] = row.Last_Notice_Time;
        });
    })

    //开始爬取动态
    searchNewDynamics(bot, UPS);
}

async function searchNewDynamics(bot, UPS) {
    for (let UID in UPS) {
        await sleep(3000).then(() => {
            searchNewDynamic(bot, UID, UPS[UID]);
        })
    };
}

// 爬取动态
async function searchNewDynamic(bot, UID, lastNociceTime) {
    let data = null;
    url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${UID}`;
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
        for (var i = 0; i < data.cards.length; i++) {
            let desc = data.cards[i].desc;
            let card = data.cards[i].card;
            let dynamicTime = desc.timestamp;
            if (dynamicTime > lastNociceTime) {
                let msg = processDynamic(desc, card);
                handleDynamicMessage(bot, msg, UID);

                // 更新动态查看时间
                let values = [Math.round(new Date().getTime() / 1000), UID];
                sql.updateUPNoticeTime(values);
            } else {
                break;
            }
        }
    }
}

// 根据动态的代码处理动态
function processDynamic(desc, card) {
    // exports.processDynamic = (desc, card) => {
    card = JSON.parse(card);
    let dyamic_id = desc.dynamic_id_str;
    let type = desc.type;
    let uname = desc.user_profile.info.uname;
    let content = null;
    let res = "";

    // 转发动态
    if (type == 1) {
        let pre_dy_id = desc.pre_dy_id_str;
        let orig_type = desc.orig_type;
        content = card.item.content;
        // 转发带有图片的原创动态
        if (orig_type == 2) {
            res = `${uname}转发了动态：\nURL：https://t.bilibili.com/${dyamic_id}\n${content}`;
            let origin = JSON.parse(card.origin);
            let description = origin.item.description;
            let origin_name = origin.user.name;
            res = `${res}\n${origin_name}：\n${description}\nURL：https://t.bilibili.com/${pre_dy_id}`;
        }
        // 转发原创纯文字动态
        else if (orig_type == 4) {
            res = `${uname}转发了动态：\nURL：https://t.bilibili.com/${dyamic_id}\n${content}`;
            let origin = JSON.parse(card.origin);
            let origin_name = origin.user.uname;
            let origin_content = origin.item.content;
            res = `${res}\n${origin_name}：\n${origin_content}\nURL：https://t.bilibili.com/${pre_dy_id}`;
        }
        // 转发视频
        else if (orig_type == 8) {
            res = `${uname}转发了视频：\nURL：https://t.bilibili.com/${dyamic_id}\n${content}`;
            let origin = JSON.parse(card.origin);
            let aid = origin.aid;
            let title = origin.title;
            res = `${res}\n${title}\nURL：https://www.bilibili.com/video/av${aid}`;
        }
        // 转发直播间
        else if (orig_type == 4200) {
            res = `${uname}转发了直播间：\nURL：https://t.bilibili.com/${dyamic_id}\n${content}`;
            let origin = JSON.parse(card.origin);
            let rid = origin.roomid;
            let title = origin.title;
            res = `${res}\n${title} URL：https://live.bilibili.com/${rid}`;
        }
        // 转发专栏
        else if (orig_type == 64) {
            res = `${uname} 转发了专栏：\nURL：https://t.bilibili.com/${dyamic_id}\n${content}`;
            let origin = JSON.parse(card.origin);
            let rid = origin.id;
            let title = origin.title;
            res = `${res}\n${title}\nURL：https://www.bilibili.com/read/cv${rid}`;
        }
        // 转发收藏夹
        else if (orig_type == 4300) {
            res = `${uname}转发了收藏夹：\nURL：https://t.bilibili.com/${dyamic_id}\n${content}`;
        }
        // 转发发表使用挂件的动态
        else if (orig_type == 2048) {
            res = `${uname}转发了动态：\nURL：https://t.bilibili.com/${dyamic_id}\n${content}`;
            let origin = JSON.parse(card.origin);
            let origin_content = origin.vest.content;
            res = `${res}\n${origin_content}\nURL：https://t.bilibili.com/${pre_dy_id}`;
        }
        // 转发原动态已失效
        else if (orig_type == 1024) {
            res = `${uname}转发了动态：\nURL：https://t.bilibili.com/${dyamic_id}\n${content}`;
            let tips = card.item.tips;
            res = `${res}\nURL：https://t.bilibili.com/${dyamic_id}\n${tips}`;
        }
    }
    // 原创图片动态
    else if (type == 2) {
        description = card.item.description;
        res = `${uname}发表了新动态：\n${description}\nURL：https://t.bilibili.com/${dyamic_id}`;
    }
    // 原创文字动态
    else if (type == 4) {
        console.log(typeof card.item);
        content = card.item.content;
        res = `${uname}发表了新动态：\n${content}\nURL：https://t.bilibili.com/${dyamic_id}`;
    }
    // 发表视频
    else if (type == 8) {
        BVID = desc.bvid;
        title = card.title;
        res = `${uname}发表了新视频：\n${title}\nURL：https://www.bilibili.com/video/${BVID}`;
    }
    // 发表使用挂件的动态
    else if (type == 2048) {
        content = card.vest.content;
        res = `${uname}发表了新动态：\n${content}\nURL：https://t.bilibili.com/${dyamic_id}`;
    }
    // 发表专栏
    else if (type == 64) {
        title = card.title;
        rid = card.id;
        res = `${uname}发表了新的专栏：\n${title}\nURL：https://www.bilibili.com/read/cv${rid}`;
    }
    return res;
}

// 发送新动态消息
function handleDynamicMessage(bot, msg, UID) {
    let values = [UID, 1];
    sql.selectGroupByUID(values).then(rows => {
        rows.forEach(row => {
            bot.sendGroupMessage(msg, row.Group_Number);
        });
    })
    values = [UID, 3];
    sql.selectGroupByUID(values).then(rows => {
        rows.forEach(row => {
            bot.sendGroupMessage(msg, row.Group_Number);
        });
    })
    values = [UID, 1];
    sql.selectPersonByUID(values).then(rows => {
        rows.forEach(row => {
            bot.sendFriendMessage(msg, row.Person_Number);
        });
    })
    values = [UID, 3];
    sql.selectPersonByUID(values).then(rows => {
        rows.forEach(row => {
            bot.sendFriendMessage(msg, row.Person_Number);
        });
    })
}