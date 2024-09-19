const abrirChamado = 'SELECT * FROM abrirChamado';
const chamadosID = 'SELECT * FROM abrirChamado WHERE id = ?';
const sqlCheckEmail = 'SELECT * FROM abrirChamado WHERE email = ?';
const sqlInsert = `INSERT INTO abrirChamado (nomeUsuario, datas, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado, email, descricao)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const sqlCheckIfExists = 'SELECT * FROM abrirChamado WHERE id = ?';
const sqlUpdate = 'UPDATE abrirChamado SET setor = ?, email = ?, nomeEquipamento = ? WHERE id = ?';
const deletarExistente = 'SELECT * FROM abrirChamado WHERE id = ?';
const sqlDelete = 'DELETE FROM abrirChamado WHERE id = ?';

module.exports = {
  abrirChamado,
  chamadosID,
  sqlCheckEmail,
  sqlInsert,
  sqlCheckIfExists,
  sqlUpdate,
  deletarExistente,
  sqlDelete
};