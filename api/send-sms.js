const twilio = require('twilio');

module.exports = async (req, res) => {
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

        console.log(`✓ Real SMS sent to ${phoneNumber}, code: ${code}`);
        res.status(200).json({ success: true, verificationCode: code });
    } catch (error) {
        // If Twilio fails (invalid credentials, account issue, etc.), use mock fallback
        console.error('Twilio error:', error.message);
        console.log(`🔧 MOCK SMS FALLBACK - Phone: ${phoneNumber}, Code: ${code}`);
        console.log(`⚠️ Fix Twilio credentials to send real SMS`);

        // Return code anyway so login works (mock mode)
        res.status(200).json({
            success: true,
            verificationCode: code,
            mock: true,
            note: 'Twilio credentials invalid - using mock SMS. Check console for code.'
        });
    }
};
