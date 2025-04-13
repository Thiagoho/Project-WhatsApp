const mysql = require('mysql2');


// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rob_teste',
    waitForConnections: true,

});



module.exports = pool;