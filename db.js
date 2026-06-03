const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'meu_banco'
});

client.connect()
    .then(() => {
        console.log('Conectado ao PostgreSQL');
    })
    .catch((err) => {
        console.error('Erro conexão banco:', err);
    });

module.exports = client;