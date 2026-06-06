const { Pool } = require('pg');

const pool_neon = new Pool({
    /*
    host: 'localhost',
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'meu_banco'
    */
   connectionString:process.env.DATABASE_URL,
   ssl:{
    rejectUnauthorized: false
   }
});

module.exports = pool_neon;