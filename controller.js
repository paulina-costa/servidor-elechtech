const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { connection } = require('./bdConfig');
const bcrypt = require('bcrypt');
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

// Função para gerar o token JWT
function gerarToken(usuario) {
  const segredo = 'seu-segredo-aqui'; // Defina seu segredo para o JWT
  const payload = { id: usuario.id, nome: usuario.nome };
  return jwt.sign(payload, segredo, { expiresIn: '1h' }); // Expira em 1 hora
}

// Função para verificar as credenciais
async function verificarCredenciais(email, senha) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM usuario WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          const usuario = results[0];
          // Comparar senha (hashing)
          const senhaValida = await bcrypt.compare(senha, usuario.password);
          if (senhaValida) {
            resolve(usuario);
          } else {
            resolve(null); // Credenciais inválidas
          }
        } else {
          resolve(null); // Usuário não encontrado
        }
      }
    });
  });
}

// Rota de cadastro
app.post('/cadastro', (req, res) => {
  const { email, nomeUsuario, password } = req.body;

  // Verifica se o nome de usuário já existe
  const queryUsuario = 'SELECT * FROM usuario WHERE nomeUsuario = ?';
  connection.query(queryUsuario, [nomeUsuario], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
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

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await verificarCredenciais(email, senha);
    if (usuario) {
      const token = gerarToken(usuario); // Gerar o token JWT
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor. Tente novamente mais tarde.' });
  }
});

app.get('/', homeRoute);
app.get('/filtros', listarRegistros(connection));
app.get('/filtros/:id', listarRegistroPorId(connection));  
app.post('/chamados', criarChamado(connection));
app.post('/filtros', filtrarChamados(connection));
app.put('/filtros/:id', atualizarChamado(connection));
app.delete('/filtros/:id', deletarChamado(connection));
app.get('*', rotaNaoExistente);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = { app };
