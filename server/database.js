var mysql = require("mysql2");

var connection = mysql.createConnection({
    host: 'localhost',
    database: 'crudapplication',
    user: 'root',
    password: 'Vaijenya@05'
});

module.exports = connection;