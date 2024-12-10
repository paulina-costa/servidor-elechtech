const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { connection } = require('./bdConfig');
const bcrypt = require('bcrypt');
require('dotenv').config();
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

// Rota para validar campos individuais
app.post('/validarCampo', (req, res) => {
  const { fieldName, value } = req.body;

  if (fieldName === 'nomeUsuario') {
      // Validação de "nome e sobrenome"
      const nomeRegex = /^[a-zA-ZÀ-ÿ]+(\s+[a-zA-ZÀ-ÿ]+)+$/;
      if (!nomeRegex.test(value.trim())) {
          return res.status(400).json({
              error: 'O nome deve conter pelo menos duas palavras (nome e sobrenome), sem números ou caracteres especiais.',
          });
      }
  } else if (fieldName === 'email') {
      // Validação de e-mail
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return res.status(400).json({ error: 'Por favor, insira um e-mail válido, ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤPor exemplo: User@example.com' });
      }

      // Verifica se o e-mail já está cadastrado
      const query = 'SELECT * FROM usuario WHERE email = ?';
      connection.query(query, [value], (err, results) => {
          if (err) {
              return res.status(500).json({ error: 'Erro ao verificar e-mail no banco.' });
          }

          if (results.length > 0) {
              return res.status(400).json({ error: 'E-mail já está em uso.' });
          }

          return res.json({ message: 'Campo válido.' });
      });
      return;
  } else if (fieldName === 'password') {
      // Validação de senha
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+.]).{8,}$/.test(value)) {
          return res.status(400).json({
              error: 'Senha deve ter ao menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.',
          });
      }
  } else {
      return res.status(400).json({ error: 'Campo inválido.' });
  }

  res.json({ message: 'Campo válido.' });
});

// Rota para cadastro de usuário
app.post('/cadastro', (req, res) => {
  const { nomeUsuario, email, password } = req.body;

  // Verificar campos obrigatórios
  if (!nomeUsuario || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Validação de "nome e sobrenome"
  const nomeRegex = /^[a-zA-ZÀ-ÿ]+(\s+[a-zA-ZÀ-ÿ]+)+$/;
  if (!nomeRegex.test(nomeUsuario.trim())) {
      return res.status(400).json({
          error: 'O nome deve conter pelo menos duas palavras (nome e sobrenome), sem números ou caracteres especiais.',
      });
  }

  // Validação de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido.' });
  }

  // Validação de senha
  const senhaRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+.]).{8,}$/;
  if (!senhaRegex.test(password)) {
      return res.status(400).json({
          error: 'Senha deve ter ao menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.',
      });
  }

  // Verifica se o nome de usuário já existe
  const queryUsuario = 'SELECT * FROM usuario WHERE nomeUsuario = ?';
  connection.query(queryUsuario, [nomeUsuario], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Erro ao verificar nome de usuário no banco.' });
      }

      // Verifica se o e-mail já existe
      const queryEmail = 'SELECT * FROM usuario WHERE email = ?';
      connection.query(queryEmail, [email], (err, results) => {
          if (err) {
              return res.status(500).json({ error: 'Erro ao verificar e-mail no banco.' });
          }

          if (results.length > 0) {
              return res.status(400).json({ error: 'E-mail já está em uso.' });
          }

          // Hash da senha antes de salvar no banco
          bcrypt.hash(password, 10, (err, hashedPassword) => {
              if (err) {
                  return res.status(500).json({ error: 'Erro ao gerar hash da senha.' });
              }

              // Insere o novo usuário no banco de dados
              const insertQuery = 'INSERT INTO usuario (email, nomeUsuario, password) VALUES (?, ?, ?)';
              connection.query(insertQuery, [email, nomeUsuario, hashedPassword], (err) => {
                  if (err) {
                      return res.status(500).json({ error: 'Erro ao salvar usuário no banco.' });
                  }

                  res.status(201).json({ message: 'Usuário criado com sucesso.' });
              });
          });
      });
  });
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

// Validação de e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'E-mail inválido.' });
}

  try {
    const usuario = await verificarCredenciais(email, senha);
    if (usuario) {
      const token = gerarToken(usuario); // Gerar o token JWT
      res.json({
        token,                // Envia o token JWT
        email: usuario.email, // Envia o e-mail do usuário
        nomeUsuario: usuario.nomeUsuario // Envia o nome do usuário
      });
    } else {
      res.status(401).json({ error: 'ㅤㅤㅤㅤCredenciais inválidas' });
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
