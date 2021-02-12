const sql = require('./scripts/sql.js');

// let values = [965555893, 1];
// sql.selectGroupKeyWords(values)
//     .then(result => {
//         result.forEach(element => {
//             console.log(element);
//         });
//     })

// let values = [908279723, "114514", "1919810", 1];
// sql.addGroupKeyWords(values)
//     .then(result => { })

let values = [965555893, 1];
sql.selectGroupKeyWords(values)
    .then(result => {
        result.forEach(element => {
            console.log(element);
        });
    })