const sql = require("./scripts/sql.js");
const axios = require("axios");

// let values = [1, 1];
// sql.selectGroupKeyWords(values)
//     .then(result => {
//         result.forEach(element => {
//             console.log(element);
//         });
//     })

// let values = [908279723, "114514", "1919810", 1];
// sql.addGroupKeyWords(values)
//     .then(result => { })

// let values = [965555893, 1];
// sql.selectExistKeyWords(values)
//     .then(result => {
//         result.forEach(element => {
//             console.log(element);
//         });
//     })

// let values = [2, 908279723, "114514"];
// sql.updateKeyWords(values)
//     .then(result => {
//         result.forEach(element => {
//             console.log(element);
//         });
//     })

// let values = [908279723, "114514"];
// sql.deleteKeyWords(values)
//     .then(result => {
//         result.forEach(element => {
//             console.log(element);
//         });
//     })

// let values = ["114514", "xiaochuansun", "1", "1", 123, 123];
// sql.addUP(values).then(res => {
//     console.log(res);
// })

// let values = ["xiaochuansun", "1544", "23465", "123456", 456, 456, "114514"];
// sql.updateUP(values).then(res => {
//     console.log(res);
// })

// let UID = "114514";
// let URL = `https://api.bilibili.com/x/space/acc/info?mid=${UID}&jsonp=jsonp`;
// // console.log(URL);

// axios.get(URL, {
//     headers: {
//         'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
//         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
//     }
// }).then((res) => {
//     console.log(res);
// })

let msg = "!删除精确关键词 1";
let instruct = msg.split(" ", 2);
console.log(instruct);