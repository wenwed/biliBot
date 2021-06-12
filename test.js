const sql = require("./scripts/sql.js");

// let values = ["测试15", "114514", 1623700613591];
// // console.log(values);
// sql.addTodo(values).then((res) => {
//     console.log(res);
// })

// let values = ["114514", 0, 2];
// sql.selectTodo(values).then((res) => {
//     console.log(res);
// })

let values = [1];
sql.deleteTodo(values).then((res) => {
    console.log(res);
})