const sql = require("./sql.js");
const axios = require("axios");

// 开启复读
exports.startRepeat = async (values) => {
    let repairWord = "";
    await sql.selectGroupBanRepeat(values).then((rows) => {
        if (rows.length === 0) {
            repairWord = `该群组已开启复读功能`;
            throw new Error("STOP");
        } else {
            return sql.deleteGroupBanRepeat(values);
        }
    }).then(() => {
        repairWord = `开启复读功能`;
    }).catch(() => {
        if (repairWord === "") {
            repairWord = `未知错误`;
        }
    })
    return repairWord;
}

// 关闭复读
exports.stopRepeat = async (values) => {
    let repairWord = "";
    await sql.selectGroupBanRepeat(values).then((rows) => {
        if (rows.length === 1) {
            repairWord = `该群组已关闭复读功能`;
            throw new Error("STOP");
        } else {
            return sql.addGroupBanRepeat(values);
        }
    }).then(() => {
        repairWord = `关闭复读功能`;
    }).catch(() => {
        if (repairWord === "") {
            repairWord = `未知错误`;
        }
    })
    return repairWord;
}

// 生成关键词列表
exports.createGroupKeyWordsList = async (values) => {
    let repairWord = "";
    let index = 0;
    await sql.selectKeyWords(values).then(rows => {
        rows.forEach(row => {
            index++;
            repairWord = `${repairWord}\n${index} ${row.Key_Word}`;
        });
    })
    if (values[1] === 1) {
        repairWord = "该群添加了如下精确关键词：" + repairWord;
    } else {
        repairWord = "该群添加了如下模糊关键词：" + repairWord;
    }
    return repairWord;
}

// 添加关键词
exports.addGroupKeyWords = async (groupID, keyWord, type, replyWord) => {
    let values = [groupID, keyWord];
    let repairWord = "";
    await sql.selectOneKeyWords(values).then(rows => {
        if (rows.length !== 0) {
            repairWord = "该群已添加此关键词";
            throw new Error("STOP");
        } else {
            values = [groupID, keyWord, replyWord, type];
            return sql.addKeyWords(values);
        }
    }).then(() => {
        repairWord = "添加成功";
    }).catch(err => {
        if (repairWord === "") {
            repairWord = "未知错误";
        }
    })
    return repairWord;
}

// 删除关键词
exports.deleteGroupKeyWords = async (values) => {
    let repairword = "";
    await sql.selectOneKeyWords(values).then(rows => {
        if (rows.length === 0) {
            repairword = "该群未添加此关键词";
            throw new Error("STOP");
        } else {
            return sql.deleteKeyWords(values);
        }
    }).then(() => {
        repairword = "删除关键词成功";
    }).catch(err => {
        if (repairword === "") {
            repairword = "未知错误";
        }
    })
    return repairword;
}

// 勋章查询（API已失效）
exports.searchBiliMedal = async (UID) => {
    // 判断UID是否为数字
    if (isNaN(UID)) {
        return "UID应为数字";
    }

    let infoURL = `http://101.201.64.44/breeze/user.t?uid=${UID}`;
    await axios.get(infoURL, {
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        }
    }).then((res) => {
        console.log(res);
    })
}