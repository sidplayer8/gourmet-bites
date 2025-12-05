// Simple script to create users table - run with: node setup-users.js
const https = require('https');

const url = 'https://gourmet-bites-2caqfdqfg-siddharths-projects-40a196e3.vercel.app/api/setup/create-users-table';

console.log('📦 Creating users table...');
console.log('Calling:', url);

https.get(url.replace('https://', 'https://'), (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.success) {
                console.log('✅ SUCCESS! Users table created');
                console.log(result);
            } else {
                console.log('❌ Failed:', result);
            }
        } catch (e) {
            console.log('Response:', data);
        }
    });
}).on('error', (e) => {
    console.error('❌ Error:', e.message);
    console.log('\n📝 MANUAL METHOD: Go to Vercel Postgres and run this SQL:');
    console.log(`
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone_number TEXT UNIQUE,
    google_email TEXT UNIQUE,
    google_id TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW()
);
    `);
});
