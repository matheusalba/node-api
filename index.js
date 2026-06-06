const express = require('express');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3002;

const pool_neon = require('./db-neon');

app.use(express.json())


app.get('/usuariosNeon', async (req, res) => {

    try{
        const result = await pool_neon.query(
            'select * from playing_with_neon'
        );
        res.json(result.rows);
    }catch(err){
        res.status(500).json({
            erro: err.message
        });
    }

})

app.get(
    '/usuarios',
    /*
    verificarToken,

    carregarUsuario,

    verificarPermissao
     */
    (req,res,next) => {
        console.log('middleware1'),
        req.dados = [ {id: 1, estado: 'teste1'} ]
        next()
    },
    
    (req,res) => {
        console.log('middleware2')
        req.dados.push({id:2, estado:'teste3'})
        res.json(req.dados)
    }
)

app.get('/filmes',async (req,res) => {
    const url = 'https://api.themoviedb.org/3/trending/movie/week?language=pt-BR'

    const options = {
        method : 'GET', 
        headers: {
            accept: 'application/json',
            Authorization : `Bearer ${process.env.TMDB_BEARER_TOKEN}`
        }
    };

    try{
        const response = await fetch(url, options);

        if(!response.ok){
            return res.status(response.status).json({
                error: 'Erro ao buscar dados no TMDB'
            });
        }
       
        const data = await response.json()

        return res.json(data)    

    }catch(e){
        console.log('Problema:',e)
        return res.status(500).json({error: 'erro '})
    }


})

app.get('/week',(req,res) => {

    const url = 'https://api.themoviedb.org/3/trending/movie/week'

    const opc = {
        methot: 'GET',
        headers: {
            accept: 'application/json',
            Authorization : `Bearer ${process.env.TMDB_BEARER_TOKEN}`
        }
    }

    fetch(url, opc)
    .then(response => {
        if(!response.ok){
            return res.status(response.status).json({
                error: 'Erro ao buscar dados no TMDB'
            })
        }
        return response.json()
    })
    .then(data => {
        const films = data.results.filter(filme => filme.vote_average > 7.5)
        res.json(films) 
    })
    .catch(e => {
        console.log('Problema:',e)
        return res.status(500).json({error: 'erro '})
    })
})

app.get('/', (req, res) => {
    res.json({
        status: 'online'
    });
});

app.listen(PORT,"0.0.0.0", () => {
    console.log(`O Servidor está rodando na porta ${PORT}`);
})