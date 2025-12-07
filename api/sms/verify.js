export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phoneNumber, code, sentCode } = req.body;

    if (!phoneNumber || !code) {
        return res.status(400).json({ error: 'Phone number and code are required' });
    }

    // TEMPORARY MVP FIX: Verify against the code sent from frontend
    // In production, use Vercel KV or Redis to store codes server-side
    if (sentCode && code === sentCode) {
        console.log(`Γ£à Verified ${phoneNumber}`);
        return res.status(200).json({ success: true, verified: true });
    }

    // Fallback: check global storage (won't work on Vercel but keeping for localhost)
    global.smsCodes = global.smsCodes || {};
    const stored = global.smsCodes[phoneNumber];

    if (stored && stored.code === code && Date.now() <= stored.expires) {
        delete global.smsCodes[phoneNumber];
        console.log(`Γ£à Verified ${phoneNumber}`);
        return res.status(200).json({ success: true, verified: true });
    }

    return res.status(400).json({ error: 'Invalid code. Please try again.' });
}
