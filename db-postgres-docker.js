const { Pool } = require('pg');

const pool_postgres_docker = new Pool({
    
    host: 'localhost',
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'meu_banco'
    
   
});

module.exports = pool_postgres_docker;