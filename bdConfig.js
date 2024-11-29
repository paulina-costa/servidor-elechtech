const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', 
  port: 3306, 
  user: 'root', 
  password: 'root', 
  database: 'siteweb'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão ao banco de dados MySQL estabelecida com sucesso.');
});

module.exports = { connection };
