const { app } = require('./server');
const { connection } = require('./bdConfig');
const moment = require('moment');
const validator = require('validator');

app.get('/', (req, res) => {
  res.send('Somos Elechtech!');
});

// Define a rota GET para listar todos os registros de "abrirChamado"
app.get('/filtros', (req, res) => {
  connection.query('SELECT * FROM abrirChamado', (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    res.json(rows);
  });
});

// Define a rota GET para listar o registro de "abrirChamado" com um ID específico
app.get('/filtros/:id', (req, res) => {
  const chamadoId = req.params.id;
  connection.query('SELECT * FROM abrirChamado WHERE id = ?', [chamadoId], (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    if (rows.length === 0) {
      res.status(404).send('Chamado não encontrado');
      return;
    }
    res.json(rows[0]);
  });
});

// Define a rota POST para criar um novo chamado
app.post('/chamados', (req, res) => {
  const { datas, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao } = req.body;

  // Validações básicas
  if (!datas || !setor || !tiposDoChamado || !nivelDeUrgencia || !nomeEquipamento || !FK_tecnicoResponsavelPeloChamado || !email) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  // Adicione uma validação para a descrição, se necessário
  if (!descricao) {
      return res.status(400).json({ erro: 'Descrição é obrigatória.' });
  }

  // Verifica se a data está no formato correto
  if (!moment(datas, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ erro: 'Data inválida. Formato esperado: YYYY-MM-DD' });
  }

  // Verifica o formato do email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ erro: 'E-mail inválido' });
  }

  // Valida o setor
  const setoresValidos = ['Sala 2', 'Sala 5', 'Pátio', 'Secretaria'];
  if (!setoresValidos.includes(setor)) {
    return res.status(400).json({ erro: 'Setor inválido' });
  }

  // Verifica o nível de urgência
  const niveisValidos = ['Crítico', 'Alto', 'Médio', 'Baixo'];
  if (!niveisValidos.includes(nivelDeUrgencia)) {
    return res.status(400).json({ erro: 'Nível de urgência inválido' });
  }

  // Verifica se o email já existe no banco de dados
  const sqlCheckEmail = 'SELECT * FROM abrirChamado WHERE email = ?';
  connection.query(sqlCheckEmail, [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar o email:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    // Se o e-mail já estiver cadastrado, retorna um erro
    if (results.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    // Se o e-mail não existir, faz a inserção do novo chamado
    const sqlInsert = `
      INSERT INTO abrirChamado (datas, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [datas, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao];

    connection.query(sqlInsert, values, (err, results) => {
      if (err) {
        console.error('Erro ao adicionar chamado:', err);
        return res.status(500).send('Erro interno do servidor');
      }

      // Retorno do ID do chamado inserido
      res.status(201).json({ message: 'Chamado adicionado com sucesso', chamadoId: results.insertId });
    });
  });
});


app.post('/filtros', (req, res) => {
  const { datas, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, resolucao, FK_tecnicoResponsavelPeloChamado, orderByDate } = req.body;

  // Filtros
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

  // Adiciona filtros válidos à consulta SQL
  filters.forEach(filter => {
    if (filter.value) {
      sql += ` AND ${filter.field} = ?`;
      values.push(filter.value);
    }
  });

  // Função para verificar se uma string é uma data válida
  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  // Filtragem por datas
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
        // Se o valor de `datas` não corresponder a nenhum dos casos esperados
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

  // Define a ordem de exibição por data (ascendente ou descendente)
  if (orderByDate) {
    if (orderByDate === 'asc') {
      sql += ' ORDER BY datas ASC'; // Mais antiga para mais recente
    } else if (orderByDate === 'desc') {
      sql += ' ORDER BY datas DESC'; // Mais recente para mais antiga
    } else {
      return res.status(400).json({
        message: 'Ordem de data inválida. Use "asc" ou "desc".'
      });
    }
  }

  // Executa a consulta SQL com os filtros e ordenação aplicados
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Erro ao buscar chamados:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }

    // Retorna os resultados filtrados
    res.status(200).json({
      message: 'Consulta realizada com sucesso',
      data: results
    });
  });
});


// Atualizar informações de um chamado
app.put('/filtros/:id', (req, res) => { 
  const chamadoId = req.params.id; 
  const { setor, email, nomeEquipamento } = req.body; 

  // Primeiro, verifica se o chamado existe
  const sqlCheckIfExists = 'SELECT * FROM abrirChamado WHERE id = ?';
  connection.query(sqlCheckIfExists, [chamadoId], (err, results) => {
      if (err) {
          console.error('Erro ao verificar a existência do chamado:', err);
          res.status(500).send('Erro interno do servidor');
          return;
      }

      // Se o chamado não existir, retorna um erro 404
      if (results.length === 0) {
          return res.status(404).json({ message: 'Chamado não encontrado.' });
      }

      // Se o chamado existir, faz a atualização
      const sqlUpdate = 'UPDATE abrirChamado SET setor = ?, email = ?, nomeEquipamento = ? WHERE id = ?';
      connection.query(sqlUpdate, [setor, email, nomeEquipamento, chamadoId], (err, result) => {
          if (err) {
              console.error('Erro ao atualizar chamado', err);
              res.status(500).send('Erro interno do servidor');
              return;
          }

          // Retorna sucesso após a atualização
          res.status(200).send('Chamado atualizado com sucesso');
      });
  });
});


// Deletar um chamado
app.delete('/filtros/:id', (req, res) => { 
  const chamadoId = req.params.id; 

  // Primeiro, verifica se o chamado existe
  const sqlCheckIfExists = 'SELECT * FROM abrirChamado WHERE id = ?';
  connection.query(sqlCheckIfExists, [chamadoId], (err, results) => { 
    if (err) { 
      console.error('Erro ao verificar a existência do chamado:', err); 
      res.status(500).send('Erro interno do servidor'); 
      return; 
    }

    // Se o chamado não existir, retorna um erro 404
    if (results.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado.' });
    }

    // Se o chamado existir, executa a exclusão
    const sqlDelete = 'DELETE FROM abrirChamado WHERE id = ?';
    connection.query(sqlDelete, [chamadoId], (err, result) => { 
      if (err) { 
        console.error('Erro ao deletar chamado', err); 
        res.status(500).send('Erro interno do servidor'); 
        return; 
      }

      // Retorna sucesso após a exclusão
      res.status(200).send('Chamado deletado com sucesso'); 
    });
  });
});


// Rota não existente
app.get('*', (req,res) => {
  res.status(404).send('Página não encontrada!');
});