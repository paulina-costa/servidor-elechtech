const { funcaoRaiz } = require('./site-sql');

// Inicializa o servidor e a conexão ao banco de dados
const { app, connection } = funcaoRaiz();

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
