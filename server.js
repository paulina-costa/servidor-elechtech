const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const mysql = require('mysql2');
app.use(mysql());

app.use(express.json());  // Middleware para trabalhar com JSON

const PORT = process.env.PORT || 3000; // Define a porta que o servidor vai escutar

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { app };
