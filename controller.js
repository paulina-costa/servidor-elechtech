const { app } = require('./servidor-sql');
const { connection } = require('./BDD-electech');

app.get('/', (req,res) => {
  res.status(200).send('Somos Elechtech!');
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
  const alunoId = req.params.id; 
  connection.query('SELECT * FROM abrirChamado WHERE id = ?', [alunoId], (err, rows) => {
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
    const { setor, email, resolucao} = req.body; 
    connection.query('UPDATE abrirChamado SET setor = ?, email = ?, resolucao = ? WHERE id = ?', 
    [setor, email, resolucao, chamadoId], (err, result) => { 
      if (err) {
        console.error('Erro ao atualizar chamado', err);
        res.status(500).send('Erro interno do servidor'); 
        return;
      }
      res.status(200).send('Chamado atualizado com sucesso'); 
    });
});

// Deletar um chamado
app.delete('/filtros/:id', (req, res) => { 
  const chamadoId = req.params.id; 
  connection.query('DELETE FROM abrirChamado WHERE id = ?', [chamadoId], (err, result) => { 
    if (err) { 
      console.error('Erro ao deletar chamado', err); 
      res.status(500).send('Erro interno do servidor'); 
      return; 
    }
    res.status(200).send('Chamado deletado com sucesso'); 
  });
});

// Rota não existente
app.get('*', (req,res) => {
  res.status(404).send('Página não encontrada!');
});