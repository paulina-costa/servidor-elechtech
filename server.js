require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('./bdConfig.js');
require('dotenv').config();
const app = express();
app.use(bodyParser.json());

// Rota de login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [result] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (result.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

        const user = result[0];
        const senhaCorreta = await bcrypt.compare(senha, user.password);

        if (!senhaCorreta) return res.status(401).json({ error: 'Senha incorreta' });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Middleware de autenticação
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não encontrado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });

        req.user = user;
        next();
    });
}

// Exemplo de rota protegida
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Acesso permitido', user: req.user });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
