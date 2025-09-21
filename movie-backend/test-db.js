require('dotenv').config();
const db = require('./config/database');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        
        // Test basic connection
        const [rows] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful!');
        
        // Create database if not exists
        await db.execute('CREATE DATABASE IF NOT EXISTS movie_recommendation');
        console.log('✅ Database movie_recommendation ready');
        
        // Use the database
        await db.execute('USE movie_recommendation');
        console.log('✅ Using movie_recommendation database');
        
        // Create users table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created successfully');
        
        // Create index
        await db.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        console.log('✅ Email index created');
        
        // Show tables
        const [tables] = await db.execute('SHOW TABLES');
        console.log('📋 Tables in database:', tables);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();