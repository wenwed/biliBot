const sql = require("./sql.js");
const axios = require("axios");

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

// 开始运行直播爬虫
exports.startLivingSpider = async (bot) => {
    let rooms = [];

    //查询群组的全部订阅房间
    let values = [1];
    await sql.selectGroupRoomTospider(values).then(rows => {
        rows.forEach(row => {
            rooms.push([row.AID, row.Live_Start_Time]);
        });
    })
    //查询群组的直播订阅房间
    values = [2];
    await sql.selectGroupRoomTospider(values).then(rows => {
        rows.forEach(row => {
            rooms.push([row.AID, row.Live_Start_Time]);
        });
    })
    //查询个人的全部订阅房间
    values = [1];
    await sql.selectPersonRoomTospider(values).then(rows => {
        rows.forEach(row => {
            rooms.push([row.AID, row.Live_Start_Time]);
        });
    })
    //查询个人的直播订阅房间
    values = [2];
    await sql.selectPersonRoomTospider(values).then(rows => {
        rows.forEach(row => {
            rooms.push([row.AID, row.Live_Start_Time]);
        });
    })

    //开始爬取房间
    searchLivingRooms(bot, rooms);
}

function searchLivingRooms(bot, rooms) {
    rooms.forEach(room => {
        // 每隔三秒爬取一次防止被限制
        sleep(3000).then(() => {
            searchLivingRoom(bot, room);
        })
    });
}

// 挨个爬取直播间状态
async function searchLivingRoom(bot, room) {
    let data = null;
    url = `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${room[0]}`;
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
    if (live_status === 1 && start_time !== room[1]) {
        let values = [start_time, room[0]];
        // 更新直播开始时间
        sql.updateUPLiveTime(values);
        // 根据不同的订阅类型发送消息
        values = [room[0], 1];
        sql.selectGroupByAID(values).then(rows => {
            rows.forEach(row => {
                handleGroupLiving(bot, data, row.Group_Number);
            });
        })
        values = [room[0], 2];
        sql.selectGroupByAID(values).then(rows => {
            rows.forEach(row => {
                handleGroupLiving(bot, data, row.Group_Number);
            });
        })
        values = [room[0], 1];
        sql.selectPersonByAID(values).then(rows => {
            rows.forEach(row => {
                handlePersonLiving(bot, data, row.Person_Number);
            });
        })
        values = [room[0], 2];
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

// 开始运行动态爬虫
exports.startDynamicSpider = async (bot) => {
    let UPS = [];

    //查询群组的全部订阅动态
    let values = [1];
    await sql.selectGroupDynamicTospider(values).then(rows => {
        rows.forEach(row => {
            UPS.push([row.AID, row.Live_Start_Time]);
        });
    })
    //查询群组的订阅动态
    values = [3];
    await sql.selectGroupDynamicTospider(values).then(rows => {
        rows.forEach(row => {
            UPS.push([row.AID, row.Live_Start_Time]);
        });
    })
    //查询个人的全部订阅动态
    values = [1];
    await sql.selectPersonDynamicTospider(values).then(rows => {
        rows.forEach(row => {
            UPS.push([row.AID, row.Live_Start_Time]);
        });
    })
    //查询个人的动态订阅
    values = [3];
    await sql.selectPersonDynamicTospider(values).then(rows => {
        rows.forEach(row => {
            UPS.push([row.AID, row.Live_Start_Time]);
        });
    })

    //开始爬取动态
    searchNewDynamic(bot, UPS);
}

function searchNewDynamics(bot, UPS) {
    UPS.forEach(UP => {
        sleep(3000).then(() => {
            searchNewDynamics(bot, UP);
        })
    });
}

// 挨个爬取动态
async function searchNewDynamics(bot, UP) {
    let data = null;
    url = `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${room[0]}`;
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
    if (live_status === 1 && start_time !== room[1]) {
        let values = [start_time, room[0]];
        // 更新直播开始时间
        sql.updateUPLiveTime(values);
        // 根据不同的订阅类型发送消息
        values = [room[0], 1];
        sql.selectGroupByAID(values).then(rows => {
            rows.forEach(row => {
                handleGroupLiving(bot, data, row.Group_Number);
            });
        })
        values = [room[0], 2];
        sql.selectGroupByAID(values).then(rows => {
            rows.forEach(row => {
                handleGroupLiving(bot, data, row.Group_Number);
            });
        })
        values = [room[0], 1];
        sql.selectPersonByAID(values).then(rows => {
            rows.forEach(row => {
                handlePersonLiving(bot, data, row.Person_Number);
            });
        })
        values = [room[0], 2];
        sql.selectPersonByAID(values).then(rows => {
            rows.forEach(row => {
                handlePersonLiving(bot, data, row.Person_Number);
            });
        })
    }
}