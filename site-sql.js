function funcaoRaiz() {
  const express = require('express'); // Importa o módulo Express
  const mysql = require('mysql'); // Importa o módulo MySQL

  const app = express(); // Cria uma instância do Express
  const port = 3000; // Define a porta

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

  // Middleware para permitir que o Express interprete JSON
  app.use(express.json());

  // Iniciar o servidor
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });

  // Retorne `app` e `connection` para serem usados em outros arquivos
  return { app, connection };
}

module.exports = { funcaoRaiz };
