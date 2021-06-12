const sql = require("./scripts/sql.js");
const middleWare = require("./scripts/middleWare.js");

// let values = ["测试15", "114514", 1623700613591];
// // console.log(values);
// sql.addTodo(values).then((res) => {
//     console.log(res);
// })

// let values = ["114514"];
// sql.selectTodo(values).then((res) => {
//     console.log(res);
// })

// let values = [1];
// sql.deleteTodo(values).then((res) => {
//     console.log(res);
// })

// middleWare.createTodo("测试45", "114514").then((res) => {
//     console.log(res);
// })

// middleWare.selectGroupTodo("114514").then((res) => {
//     console.log(res);
// })

middleWare.completeTodo(4).then((res) => {
    console.log(res);
})