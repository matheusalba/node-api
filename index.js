const express = require('express');

const PORT = process.env.PORT || 3000;

require('dotenv').config();

const pool = require('./db');

const { gerarExcel } = require('./Services/excelService');

const app = express();


app.get('/exportar', async (req,res) => {
    
    const usuarios = await db.query(
        'select * from usuarios'
    );

    const workbook = await gerarExcel(usuarios)

    res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

    res.setHeader(
    'Content-Disposition',
    'attachment; filename=usuarios.xlsx'
    )

    await workbook.xlsx.write(res)
    
    res.end()
})



app.get('/usuariosbanco', async (req, res) => {

    try{
        const result = await pool.query(
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

app.listen(PORT, () => {
    console.log(`O Servidor está rodando na porta ${PORT}`);
})

app.listen(3000, () => {
    console.log('rodando ok');
});

