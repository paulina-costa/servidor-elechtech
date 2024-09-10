function funcaoBDD() {
    const mysql = require('mysql'); // Importa o módulo MySQL

    // Configuração do banco de dados
  const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'siteWeb'
  });

  // Conexão com o banco de dados
  connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      throw err;
    }
    console.log('Conexão bem-sucedida ao banco de dados');
  });

    // Retorne `app` e `connection` para serem usados em outros arquivos
    return {connection };
  }
  
  module.exports = { funcaoBDD };
  