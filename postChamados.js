app.post('/chamados', (req, res) => { // Define uma rota POST para criar um novo aluno
    const { nomeUsuario, datas, email, descricao, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, resolucao, FK_tecnicoResponsavelPeloChamado } = req.body; // Extrai os dados do novo aluno do corpo da requisição
    connection.query('INSERT INTO abrirChamado (nomeUsuario, datas, email, descricao, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, resolucao,FK_tecnicoResponsavelPeloChamado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [nomeUsuario, datas, email, descricao, setor, tiposDoChamado,nivelDeUrgencia,nomeEquipamento,resolucao,FK_tecnicoResponsavelPeloChamado], (err, result) => { // Executa uma consulta SQL para inserir um novo aluno na tabela
      if (err) { // Verifica se houve erro ao inserir o aluno
        console.error('Erro ao inserir aluno:', err); // Loga o erro no console
        res.status(500).send('Erro interno do servidor'); // Envia uma resposta de erro 500
        return; // Encerra a função para não continuar a execução
      }
      res.status(201).send('Chamado criado com sucesso'); // Envia uma resposta 201 (Criado) se o aluno foi inserido com sucesso
    });
});