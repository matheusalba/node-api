const express = require('express');

require('dotenv').config();
const bcrypt = require('bcrypt');

const app = express();

const PORT = process.env.PORT || 3002;


const jwt = require('jsonwebtoken');

const chave_interna_api_cadastro = Number(process.env.CHAVE_INTERNA_API_CADASTRO);
const SEGREDO = process.env.SEGREDO_AUTH_JWT;
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

const pool_neon = require('./db-neon');
const pool_postgres_docker = require('./db-postgres-docker');

app.use(express.json())

function verificarToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {    
        return res.status(401).json({
            error: 'Token de autenticação não fornecido'
        });
    }

    try{
        const decoded = jwt.verify(token, SEGREDO);
        req.user = decoded;
        next();
    }   
    catch(error){
        return res.status(403).json({
            error: 'Token de autenticação inválido'
        });
    }
}


app.post('/login', async (req,res) => {
    const {email, password} = req.body;

    if(!email || !password)
    {
        return res.status(400).json({
            error: 'Email e senha são obrigatórios'
        }); 
    }

    try{
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool_postgres_docker.query(query, [email]);
        if(result.rows.length === 0)
        {
            return res.status(401).json({
                error: 'E-mail não encontrado'
            });
        }
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if(!passwordMatch)
        {
            return res.status(401).json({
                error: 'Senha inválida'
            });
        }

        

        const token = jwt.sign(
            {id: user.id, email: user.email},
            SEGREDO,
            {expiresIn: '30m'}
        )

        return res.status(200).json({
            message: 'Login bem-sucedido',
            token: token   
        })
    }catch(error){
        console.error('Erro ao realizar login:', error);
        return res.status(500).json({
            error: 'Erro ao realizar login'
        });
    }


})

app.post('/register', async (req, res) => {
    const { name, email, password, chave_interna_api } = req.body;

    if(chave_interna_api_cadastro != chave_interna_api) {
        return res.status(403).json({
            error: 'Chave de API interna inválida'
        });
    }

    if (!name ||!email || !password) {
        return res.status(400).json({
            error: 'Nome, email e senha são obrigatórios'
        });
    }
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const query = 'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email';
            const values = [name, email, hashedPassword];

            const result = await pool_postgres_docker.query(query, values);

            res.status(201).json({
                message: 'Usuário registrado com sucesso',
                user: result.rows[0]
            });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    error: 'Email já registrado'
                })
            }
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({
                error: 'Erro ao registrar usuário'
            });
            
        }
    }
);

app.get('/usuariosNeon', verificarToken, async (req, res) => {

    try {
        const result = await pool_neon.query(
            'select * from playing_with_neon'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            erro: err.message
        });
    }

})

app.get(
    '/usuarios',
    
    verificarToken,
    /*
    carregarUsuario,

    verificarPermissao
     */
    (req, res, next) => {
        console.log('middleware1'),
            req.dados = [{ id: 1, estado: 'teste1' }]
        next()
    },

    (req, res) => {
        console.log('middleware2')
        req.dados.push({ id: 2, estado: 'teste3' })
        res.json(req.dados)
    }
)

app.get('/filmes',verificarToken ,async (req, res) => {
    const url = 'https://api.themoviedb.org/3/trending/movie/week?language=pt-BR'

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`
        }
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Erro ao buscar dados no TMDB'
            });
        }

        const data = await response.json()

        return res.json(data)

    } catch (e) {
        console.log('Problema:', e)
        return res.status(500).json({ error: 'erro ' })
    }


})

app.get('/week',verificarToken,async (req, res) => {
    console.log(`olá Bearer ${process.env.TMDB_BEARER_TOKEN}`)
    const url = 'https://api.themoviedb.org/3/trending/movie/week'

    const opc = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`
        }
    }

    try{
    const r = await fetch(url, opc)

        if(!r.ok){
            return res.status(r.status).json({
                error: 'Erro ao buscar dados no TMDB: TOKEN INVÁLIDO OU URL ERRADA'
            })
        }
        
        const data = await r.json()

        if(!data||!data.results){
            return res.status(500).json({
                error: 'Não foi retornado a linha de resultados esperada'
            })
        }

        const films = data.results.filter(filme => filme.vote_average > 7.5)
        res.json(films)

    }catch(e){
        console.log('Problema:', e)
        return res.status(500).json({ error: 'erro ' })
    }

        /*
    fetch(url, opc)
        .then(response => {
            if (!response.ok) {
                return res.status(response.status).json({
                    error: 'Erro ao buscar dados no TMDB'
                })
            }
            return response.json()
        })
        .then(data => {
            if(!data.ok){return}
            const films = data.results.filter(filme => filme.vote_average > 7.5)
            res.json(films)
        })
        .catch(e => {
            console.log('Problema:', e)
            return res.status(500).json({ error: 'erro ' })
        })*/
})

app.get('/', (req, res) => {
    res.json({
        status: 'online hehe Valeu RENDER!'
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`O Servidor está rodando na porta ${PORT}`);
})