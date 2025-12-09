const twilio = require('twilio');

// In-memory storage for verification codes (use Redis in production)
const codes = {};

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

    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ success: false, error: 'Phone number required' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        await client.messages.create({
            body: `Your Gourmet Bites verification code is: ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        // Store code (expires in 5 minutes)
        codes[phoneNumber] = {
            code: code,
            expires: Date.now() + 300000
        };

        console.log(`SMS sent to ${phoneNumber}`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Twilio error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Export codes for verify function
module.exports.codes = codes;
