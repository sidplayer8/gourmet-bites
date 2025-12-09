// Import shared codes storage
const { codes } = require('./send-sms');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
        return res.status(400).json({ success: false, error: 'Phone number and code required' });
    }

    const stored = codes[phoneNumber];

    if (!stored) {
        return res.status(400).json({ success: false, error: 'No code found for this number' });
    }

    if (Date.now() > stored.expires) {
        delete codes[phoneNumber];
        return res.status(400).json({ success: false, error: 'Code expired' });
    }

    if (stored.code === code) {
        delete codes[phoneNumber];
        console.log(`Code verified for ${phoneNumber}`);
        return res.status(200).json({ success: true });
    }

    res.status(400).json({ success: false, error: 'Invalid code' });
};
