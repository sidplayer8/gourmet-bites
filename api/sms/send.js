import twilio from 'twilio';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // NOTE: Vercel serverless functions are stateless, so global storage doesn't work
    // For production, use Vercel KV or Redis
    // For now, return code in response for testing
    global.smsCodes = global.smsCodes || {};
    global.smsCodes[phoneNumber] = {
        code,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );

    try {
        await client.messages.create({
            body: `Your Gourmet Bites verification code is: ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log(`Γ£à SMS sent to ${phoneNumber} with code ${code}`);

        // TEMPORARY: Return code for MVP testing (remove in production)
        res.status(200).json({ success: true, code: code });
    } catch (error) {
        console.error('Γ¥î Twilio error:', error);
        res.status(500).json({ error: error.message });
    }
}
