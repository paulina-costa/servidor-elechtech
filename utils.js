const moment = require('moment');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Função para a rota '/'
const homeRoute = (req, res) => {
  res.send('Somos Elechtech!');
};

// Função para verificar as credenciais e gerar o token
const loginUsuario = (connection) => (req, res) => {
  const { email, password } = req.body;

  // Verifica se o email e a senha foram fornecidos
  if (!email || !password) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  const sqlCheckEmail = 'SELECT * FROM usuario WHERE email = ?';
  connection.query(sqlCheckEmail, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    // Verifica se a senha é válida
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Erro ao comparar senha:', err);
        return res.status(500).json({ erro: 'Erro interno ao comparar senha.' });
      }

      if (!isMatch) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      // Gera o token JWT
      const payload = { id: user.id, nomeUsuario: user.nomeUsuario, email: user.email };
      const token = jwt.sign(payload, 'secreta-chave-jwt', { expiresIn: '1h' });

      return res.status(200).json({ message: 'Login bem-sucedido.', token });
    });
  });
};

// Função para listar todos os registros
const listarRegistros = (connection) => (req, res) => {
  connection.query('SELECT * FROM abrirChamado', (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    res.json(rows);
  });
};

// Função para listar um registro por ID
const listarRegistroPorId = (connection) => async (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM abrirChamado WHERE id = ?';

  connection.query(sql, [id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao buscar chamado.' });
    }
    if (results.length > 0) {
      const chamado = results[0];
      chamado.datas = moment(chamado.datas).format('YYYY-MM-DD');
      return res.status(200).json(chamado);
    } else {
      return res.status(404).json({ message: 'Chamado não encontrado.' });
    }
  });
};

// Função para criar um novo chamado
const criarChamado = (connection) => (req, res) => {
  const {
    nomeUsuario, datas, setor, tiposDoChamado,
    nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado,
    email, descricao
  } = req.body;

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (!datas || !setor || !tiposDoChamado || !nivelDeUrgencia || 
      !nomeEquipamento || !FK_tecnicoResponsavelPeloChamado || !email || !descricao) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  if (!moment(datas, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ erro: 'Data inválida. Formato esperado: YYYY-MM-DD' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ erro: 'E-mail inválido' });
  }

  const setoresValidos = ['Sala 2', 'Sala 5', 'Pátio', 'Secretaria'];
  if (!setoresValidos.includes(setor)) {
    return res.status(400).json({ erro: 'Setor inválido' });
  }

  const niveisValidos = ['Crítico', 'Alto', 'Médio', 'Baixo'];
  if (!niveisValidos.includes(nivelDeUrgencia)) {
    return res.status(400).json({ erro: 'Nível de urgência inválido' });
  }

  const sqlInsert = `
    INSERT INTO abrirChamado (nomeUsuario, datas, setor, tiposDoChamado,
    nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [nomeUsuario, datas, setor, tiposDoChamado, nivelDeUrgencia,
                  nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao];

  connection.query(sqlInsert, values, (err, results) => {
    if (err) {
      console.error('Erro ao adicionar chamado:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    res.status(201).json({ message: 'Chamado adicionado com sucesso', chamadoId: results.insertId });
  });
};

// Função para filtrar chamados
const filtrarChamados = (connection) => (req, res) => {
  const { filtro } = req.body;

  const sqlFilter = 'SELECT * FROM abrirChamado WHERE setor = ?';
  connection.query(sqlFilter, [filtro], (err, rows) => {
    if (err) {
      console.error('Erro ao filtrar chamados:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    res.json(rows);
  });
};

// Função para atualizar um chamado
const atualizarChamado = (connection) => (req, res) => {
  const { id } = req.params;
  const { nomeUsuario, datas, setor, tiposDoChamado, nivelDeUrgencia,
    nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao } = req.body;

  const sqlUpdate = `
    UPDATE abrirChamado 
    SET nomeUsuario = ?, datas = ?, setor = ?, tiposDoChamado = ?, 
    nivelDeUrgencia = ?, nomeEquipamento = ?, FK_tecnicoResponsavelPeloChamado = ?, 
    email = ?, descricao = ?
    WHERE id = ?
  `;

  const values = [nomeUsuario, datas, setor, tiposDoChamado, nivelDeUrgencia,
                  nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao, id];

  connection.query(sqlUpdate, values, (err, results) => {
    if (err) {
      console.error('Erro ao atualizar chamado:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    res.status(200).json({ message: 'Chamado atualizado com sucesso' });
  });
};

// Função para deletar um chamado
const deletarChamado = (connection) => (req, res) => {
  const { id } = req.params;

  const sqlDelete = 'DELETE FROM abrirChamado WHERE id = ?';
  connection.query(sqlDelete, [id], (err, results) => {
    if (err) {
      console.error('Erro ao deletar chamado:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    res.status(200).json({ message: 'Chamado deletado com sucesso' });
  });
};

// Função para lidar com rotas não existentes
const rotaNaoExistente = (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
};

// Middleware para verificar o token JWT
const verificarToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(403).json({ message: 'Acesso negado, token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, 'secreta-chave-jwt');
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

// Exportação das funções
module.exports = {
  homeRoute,
  listarRegistros,
  listarRegistroPorId,
  criarChamado,
  filtrarChamados,
  atualizarChamado,
  deletarChamado,
  rotaNaoExistente,
  loginUsuario,
  verificarToken
};
