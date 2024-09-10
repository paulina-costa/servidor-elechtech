function funcaoServidor() {
  const express = require('express'); // Importa o módulo Express

  const app = express(); // Cria uma instância do Express
  const port = 3000; // Define a porta

  // Middleware para permitir que o Express interprete JSON
  app.use(express.json());

  // Iniciar o servidor
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });

  // Retorne `app` e `connection` para serem usados em outros arquivos
  return { app };
}

module.exports = { funcaoServidor };
