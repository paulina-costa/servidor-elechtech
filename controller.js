const { app } = require('./servidor-sql');
const { connection } = require('./BDD-electech');

app.get('/', (req,res) => {
  res.send('Somos Elechtech!');
});

// Define a rota GET para listar todos os registros de "abrirChamado"
app.get('/chamados', (req, res) => {
  connection.query('SELECT * FROM abrirChamado', (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    res.json(rows); // Envia os registros como resposta em formato JSON
  });
});

app.get('/chamados/:id', (req, res) => { // Define uma rota GET para buscar um aluno específico pelo ID
  const alunoId = req.params.id; // Obtém o ID do aluno a partir dos parâmetros da rota
  connection.query('SELECT * FROM abrirChamado WHERE id = ?', [alunoId], (err, rows) => { // Executa uma consulta SQL para buscar o aluno pelo ID
    if (err) { // Verifica se houve erro ao executar a consulta
      console.error('Erro ao executar a consulta:', err); // Loga o erro no console
      res.status(500).send('Erro interno do servidor'); // Envia uma resposta de erro 500
      return; // Encerra a função para não continuar a execução
    }
    if (rows.length === 0) { // Verifica se o chamado foi encontrado (se a consulta retornou algum registro)
      res.status(404).send('Chamado não encontrado'); // Envia uma resposta 404 (Não encontrado) se o aluno não existe
      return; // Encerra a função para não continuar a execução
    }
    res.json(rows[0]); // Envia o primeiro (e único) registro encontrado como resposta em formato JSON
  });
});

app.post('/chamados', (req, res) => {
  const { datas, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, resolucao, FK_tecnicoResponsavelPeloChamado, orderByDate } = req.body;

  // Cria um array de filtros
  const filters = [
    { field: 'datas', value: datas },
    { field: 'setor', value: setor },
    { field: 'tiposDoChamado', value: tiposDoChamado },
    { field: 'nivelDeUrgencia', value: nivelDeUrgencia },
    { field: 'nomeEquipamento', value: nomeEquipamento },
    { field: 'resolucao', value: resolucao },
    { field: 'FK_tecnicoResponsavelPeloChamado', value: FK_tecnicoResponsavelPeloChamado }
  ];

  // Base da consulta SQL
  let sql = 'SELECT * FROM abrirChamado WHERE 1=1';
  const values = [];

  // Adiciona filtros válidos à consulta SQL
  filters.forEach(filter => {
    if (filter.value) {
      sql += ` AND ${filter.field} = ?`;
      values.push(filter.value);
    }
  });

  // Define a ordem de exibição por data (ascendente ou descendente)
  if (orderByDate === 'asc') {
    sql += ' ORDER BY datas ASC'; // Mais antiga para mais recente
  } else if (orderByDate === 'desc') {
    sql += ' ORDER BY datas DESC'; // Mais recente para mais antiga
  }

  // Executa a consulta SQL com os filtros e ordenação aplicados
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Erro ao buscar chamados:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }

    // Retorna os resultados filtrados
    res.status(200).json(results);
  });
});



  // Atualizar informações de um chamado
  app.put('/chamados/:id', (req, res) => { // Define uma rota PUT para atualizar um Chamado existente
    const chamadoId = req.params.id; // Obtém o ID do Chamado a partir dos parâmetros da rota
    const { setor, email, resolucao} = req.body; // Extrai os novos dados do Chamado do corpo da requisição
    connection.query('UPDATE abrirChamado SET setor = ?, email = ?, resolucao = ? WHERE id = ?', 
    [setor, email, resolucao, chamadoId], (err, result) => { // Executa uma consulta SQL para atualizar o Chamado
      if (err) { // Verifica se houve erro ao atualizar o Chamado
        console.error('Erro ao atualizar chamado', err); // Loga o erro no console
        res.status(500).send('Erro interno do servidor'); // Envia uma resposta de erro 500
        return; // Encerra a função para não continuar a execução
      }
      res.send('Chamado atualizado com sucesso'); // Envia uma resposta de sucesso se o Chamado foi atualizado
    });
});

// Deletar um chamado
app.delete('/chamados/:id', (req, res) => { // Define uma rota DELETE para excluir um chamado
  const chamadoId = req.params.id; // Obtém o ID do chamado a partir dos parâmetros da rota
  connection.query('DELETE FROM abrirChamado WHERE id = ?', [chamadoId], (err, result) => { // Executa uma consulta SQL para excluir o chamado
    if (err) { // Verifica se houve erro ao deletar o chamado
      console.error('Erro ao deletar chamado', err); // Loga o erro no console
      res.status(500).send('Erro interno do servidor'); // Envia uma resposta de erro 500
      return; // Encerra a função para não continuar a execução
    }
    res.send('Chamado deletado com sucesso'); // Envia uma resposta de sucesso se o chamado foi excluído
  });
});

app.get('*', (req,res) => {
  res.send('Página não encontrada!');
});