app.get('/chamados/:id', (req, res) => { // Define uma rota GET para buscar um aluno específico pelo ID
    const alunoId = req.params.id; // Obtém o ID do aluno a partir dos parâmetros da rota
    connection.query('SELECT * FROM abrirChamado WHERE id = ?', [alunoId], (err, rows) => { // Executa uma consulta SQL para buscar o aluno pelo ID
      if (err) { // Verifica se houve erro ao executar a consulta
        console.error('Erro ao executar a consulta:', err); // Loga o erro no console
        res.status(500).send('Erro interno do servidor'); // Envia uma resposta de erro 500
        return; // Encerra a função para não continuar a execução
      }
      if (rows.length === 0) { // Verifica se o aluno foi encontrado (se a consulta retornou algum registro)
        res.status(404).send('Chamado não encontrado'); // Envia uma resposta 404 (Não encontrado) se o aluno não existe
        return; // Encerra a função para não continuar a execução
      }
      res.json(rows[0]); // Envia o primeiro (e único) registro encontrado como resposta em formato JSON
    });
});