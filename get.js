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
