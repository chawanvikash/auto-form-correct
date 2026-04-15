const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    
    ssl: process.env.DATABASE_URL.includes("localhost") 
        ? false 
        : { rejectUnauthorized: false },
   
    max: 20,                
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000, 
});


pool.on('connect', () => {
    console.log('PostgreSQL Pool: Connected to Database');
});

pool.on('error', (err) => {
    console.error('PostgreSQL Pool Error:', err.message);
 
});

module.exports = pool;