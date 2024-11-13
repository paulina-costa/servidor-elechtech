const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt')
const { connection } = require('./bdConfig');
const {
  homeRoute,
  listarRegistros,
  listarRegistroPorId,
  criarChamado,
  filtrarChamados,
  atualizarChamado,
  deletarChamado,
  rotaNaoExistente
} = require('./utils');

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Para fazer parsing de JSON no corpo da requisição

app.get('/', homeRoute);

app.get('/filtros', listarRegistros(connection));

app.get('/filtros/:id', listarRegistroPorId(connection));  // Certifique-se de que o id da query está correto

app.post('/chamados', criarChamado(connection));

app.post('/filtros', filtrarChamados(connection));

// Rota de cadastro
app.post('/cadastro', (req, res) => {
  const { email, nomeUsuario, password } = req.body;

  // Validação da senha (agora exigindo uma letra maiúscula)
  const senhaRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^.&*()_+])[A-Za-z\d!@#$%^.&*()_+]{8,}$/;
  if (!senhaRegex.test(password)) {
    return res.status(400).json({
      error: 'A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.',
    });
  }

  // Verifica se o nome de usuário já existe
  const queryUsuario = 'SELECT * FROM usuario WHERE nomeUsuario = ?';
  connection.query(queryUsuario, [nomeUsuario], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Verifica se o e-mail já existe
    const queryEmail = 'SELECT * FROM usuario WHERE email = ?';
    connection.query(queryEmail, [email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'E-mail já está em uso' });
      }

      // Hash da senha antes de salvar no banco
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: err.message });

        // Criação do novo usuário no banco de dados
        const insertQuery = 'INSERT INTO usuario (email, nomeUsuario, password) VALUES (?, ?, ?)';
        connection.query(insertQuery, [email, nomeUsuario, hashedPassword], (err, results) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.status(201).json({ message: 'Usuário criado com sucesso' });
        });
      });
    });
  });
});

app.put('/filtros/:id', atualizarChamado(connection));

app.delete('/filtros/:id', deletarChamado(connection));

app.get('*', rotaNaoExistente);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = { app };
