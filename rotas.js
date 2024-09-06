const { funcaoRaiz } = require('./site-sql');

// Inicializa o servidor e a conexão ao banco de dados
const { app, connection } = funcaoRaiz();

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

// POST para filtrar chamados
app.post('/chamados', (req, res) => { 
  const { datas, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, resolucao, FK_tecnicoResponsavelPeloChamado } = req.body;

  // Base da consulta SQL
  let sql = 'SELECT * FROM abrirChamado WHERE 1=1';  // 1=1 é apenas um truque para facilitar a adição das condições
  const values = [];

  // Verifica se cada campo foi passado e, caso sim, adiciona à consulta
  if (datas) {
    sql += ' AND datas = ?';
    values.push(datas);
  }

  if (setor) {
    sql += ' AND setor = ?';
    values.push(setor);
  }

  if (tiposDoChamado) {
    sql += ' AND tiposDoChamado = ?';
    values.push(tiposDoChamado);
  }

  if (nivelDeUrgencia) {
    sql += ' AND nivelDeUrgencia = ?';
    values.push(nivelDeUrgencia);
  }

  if (nomeEquipamento) {
    sql += ' AND nomeEquipamento = ?';
    values.push(nomeEquipamento);
  }

  if (resolucao) {
    sql += ' AND resolucao = ?';
    values.push(resolucao);
  }

  if (FK_tecnicoResponsavelPeloChamado) {
    sql += ' AND FK_tecnicoResponsavelPeloChamado = ?';
    values.push(FK_tecnicoResponsavelPeloChamado);
  }

  // Executa a consulta SQL com os filtros aplicados
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