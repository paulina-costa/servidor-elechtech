// utils.js
const moment = require('moment');
const validator = require('validator');

// Função para a rota '/'
const homeRoute = (req, res) => {
  res.send('Somos Elechtech!');
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
const listarRegistroPorId = (connection) => (req, res) => {
  const chamadoId = req.params.id;
  connection.query('SELECT * FROM abrirChamado WHERE id = ?', [chamadoId], (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).send('Erro interno do servidor');
    }
    if (rows.length === 0) {
      return res.status(404).send('Chamado não encontrado');
    }
    res.json(rows[0]);
  });
};

// Função para criar um novo chamado
const criarChamado = (connection) => (req, res) => {
  const {
    nomeUsuario, datas, setor, tiposDoChamado,
    nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado,
    email, descricao
  } = req.body;

  // Validações
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

  const sqlCheckEmail = 'SELECT * FROM abrirChamado WHERE email = ?';
  connection.query(sqlCheckEmail, [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar o email:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    if (results.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
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
  });
};

// Função para filtrar chamados
const filtrarChamados = (connection) => (req, res) => {
  const { 'tipo-chamado': tiposDoChamado, 'nivel-urgencia': nivelDeUrgencia, setor, equipamento: nomeEquipamento } = req.body;
  const { datas, resolucao, FK_tecnicoResponsavelPeloChamado, orderByDate } = req.body;

  const filters = [
    { field: 'setor', value: setor },
    { field: 'tiposDoChamado', value: tiposDoChamado },
    { field: 'nivelDeUrgencia', value: nivelDeUrgencia },
    { field: 'nomeEquipamento', value: nomeEquipamento },
    { field: 'resolucao', value: resolucao },
    { field: 'FK_tecnicoResponsavelPeloChamado', value: FK_tecnicoResponsavelPeloChamado }
  ];

  let sql = 'SELECT * FROM abrirChamado WHERE 1=1';
  const values = [];

  filters.forEach(filter => {
    if (filter.value) {
      sql += ` AND ${filter.field} = ?`;
      values.push(filter.value);
    }
  });

  // Lógica para filtrar pela data
  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  if (datas) {
    const currentDate = new Date();
    let dateFilter;

    switch (datas) {
      case '7dias':
        dateFilter = new Date(currentDate.setDate(currentDate.getDate() - 7));
        break;
      case '1mes':
        dateFilter = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        break;
      case '3meses':
        dateFilter = new Date(currentDate.setMonth(currentDate.getMonth() - 3));
        break;
      case '6meses':
        dateFilter = new Date(currentDate.setMonth(currentDate.getMonth() - 6));
        break;
      case '1ano':
        dateFilter = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
        break;
      default:
        return res.status(400).json({
          message: 'Filtro de datas inválido. Use "7dias", "1mes", "3meses", "6meses" ou "1ano".'
        });
    }

    if (dateFilter && isValidDate(dateFilter)) {
      sql += ` AND datas >= ?`;
      values.push(dateFilter);
    } else {
      return res.status(400).json({
        message: 'Data inválida fornecida.'
      });
    }
  }

  // Ordem pela data
  if (orderByDate) {
    if (orderByDate === 'asc') {
      sql += ' ORDER BY datas ASC';
    } else if (orderByDate === 'desc') {
      sql += ' ORDER BY datas DESC';
    } else {
      return res.status(400).json({
        message: 'Ordem de data inválida. Use "asc" ou "desc".'
      });
    }
  }

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Erro ao buscar chamados:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    res.status(200).json({
      message: 'Consulta realizada com sucesso',
      data: results
    });
  });
};

// Função para atualizar um chamado
const atualizarChamado = (connection) => (req, res) => {
  const chamadoId = req.params.id;
  const { setor, email, nomeEquipamento } = req.body;

  const sqlCheckIfExists = 'SELECT * FROM abrirChamado WHERE id = ?';
  connection.query(sqlCheckIfExists, [chamadoId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar a existência do chamado:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado.' });
    }

    const sqlUpdate = 'UPDATE abrirChamado SET setor = ?, email = ?, nomeEquipamento = ? WHERE id = ?';
    connection.query(sqlUpdate, [setor, email, nomeEquipamento, chamadoId], (err, result) => {
      if (err) {
        console.error('Erro ao atualizar chamado', err);
        return res.status(500).send('Erro interno do servidor');
      }

      res.status(200).send('Chamado atualizado com sucesso');
    });
  });
};

// Função para deletar um chamado
const deletarChamado = (connection) => (req, res) => {
  const chamadoId = req.params.id;

  const sqlCheckIfExists = 'SELECT * FROM abrirChamado WHERE id = ?';
  connection.query(sqlCheckIfExists, [chamadoId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar a existência do chamado:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado.' });
    }

    const sqlDelete = 'DELETE FROM abrirChamado WHERE id = ?';
    connection.query(sqlDelete, [chamadoId], (err, result) => {
      if (err) {
        console.error('Erro ao deletar chamado', err);
        return res.status(500).send('Erro interno do servidor');
      }

      res.status(200).send('Chamado deletado com sucesso');
    });
  });
};

// Função para rota não existente
const rotaNaoExistente = (req, res) => {
  res.status(404).send('Página não encontrada!');
};

module.exports = {
  homeRoute,
  listarRegistros,
  listarRegistroPorId,
  criarChamado,
  filtrarChamados,
  atualizarChamado,
  deletarChamado,
  rotaNaoExistente
};
