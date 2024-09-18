const express = require('express');

const { connection } = require('./bdConfig');
const {
  homeRoute,
  listarRegistros,
  listarRegistroPorId,
  criarChamado,
  filtrarChamados,
  atualizarChamado,
  deletarChamado,
  rotaNaoExistente
} = require('./utils');

const app = express();
const port = 3000;

app.use(express.json()); // Para fazer parsing de JSON no corpo da requisição

app.get('/', homeRoute);

app.get('/filtros', listarRegistros(connection));

app.get('/filtros/:id', listarRegistroPorId(connection));

app.post('/chamados', criarChamado(connection));

app.post('/filtros', filtrarChamados(connection));

app.put('/filtros/:id', atualizarChamado(connection));

app.delete('/filtros/:id', deletarChamado(connection));

app.get('*', rotaNaoExistente);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = { app };
