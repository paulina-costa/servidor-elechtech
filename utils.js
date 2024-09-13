/*============================================== Inicio do get de filtros ================================*/
  
/*============================================== Fim do get de filtros ================================*/


/*============================================== Inicio do post de cadastros ================================*/
// utils.js
const moment = require('moment');
const validator = require('validator');

// Função para criar um novo chamado
function criarChamado(connection, dadosChamado, callback) {
  const { datas, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao } = dadosChamado;

  // Validações básicas
  if (!datas || !setor || !tiposDoChamado || !nivelDeUrgencia || !nomeEquipamento || !FK_tecnicoResponsavelPeloChamado || !email) {
    return callback({ status: 400, erro: 'Todos os campos são obrigatórios.' });
  }

  // Valida a descrição
  if (!descricao) {
    return callback({ status: 400, erro: 'Descrição é obrigatória.' });
  }

  // Verifica se a data está no formato correto
  if (!moment(datas, 'YYYY-MM-DD', true).isValid()) {
    return callback({ status: 400, erro: 'Data inválida. Formato esperado: YYYY-MM-DD' });
  }

  // Verifica o formato do email
  if (!validator.isEmail(email)) {
    return callback({ status: 400, erro: 'E-mail inválido' });
  }

  // Valida o setor
  const setoresValidos = ['Sala 2', 'Sala 5', 'Pátio', 'Secretaria'];
  if (!setoresValidos.includes(setor)) {
    return callback({ status: 400, erro: 'Setor inválido' });
  }

  // Verifica o nível de urgência
  const niveisValidos = ['Crítico', 'Alto', 'Médio', 'Baixo'];
  if (!niveisValidos.includes(nivelDeUrgencia)) {
    return callback({ status: 400, erro: 'Nível de urgência inválido' });
  }

  // Verifica se o email já existe no banco de dados
  const sqlCheckEmail = 'SELECT * FROM abrirChamado WHERE email = ?';
  connection.query(sqlCheckEmail, [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar o email:', err);
      return callback({ status: 500, erro: 'Erro interno do servidor' });
    }

    // Se o e-mail já estiver cadastrado, retorna um erro
    if (results.length > 0) {
      return callback({ status: 409, erro: 'Email já cadastrado' });
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
        return callback({ status: 500, erro: 'Erro interno do servidor' });
      }

      // Retorna o ID do chamado inserido
      callback(null, { status: 201, message: 'Chamado adicionado com sucesso', chamadoId: results.insertId });
    });
  });
}

module.exports = { criarChamado };

/*============================================== Fim do post de cadastros ================================*/

