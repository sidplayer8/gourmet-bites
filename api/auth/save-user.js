import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phoneNumber, googleEmail, googleId, displayName, avatarUrl } = req.body;

    if (!displayName) {
        return res.status(400).json({ error: 'Display name is required' });
    }

    try {
        let result;

        if (phoneNumber) {
            // SMS/Phone login
            result = await sql`
                INSERT INTO users (phone_number, display_name, last_login)
                VALUES (${phoneNumber}, ${displayName}, NOW())
                ON CONFLICT (phone_number) 
                DO UPDATE SET 
                    display_name = ${displayName},
                    last_login = NOW()
                RETURNING id, phone_number, display_name, created_at
            `;
            console.log('✅ Phone user saved:', phoneNumber);
        } else if (googleId) {
            // Google login
            result = await sql`
                INSERT INTO users (google_id, google_email, display_name, avatar_url, last_login)
                VALUES (${googleId}, ${googleEmail}, ${displayName}, ${avatarUrl}, NOW())
                ON CONFLICT (google_id)
                DO UPDATE SET 
                    google_email = ${googleEmail},
                    display_name = ${displayName},
                    avatar_url = ${avatarUrl},
                    last_login = NOW()
                RETURNING id, google_id, google_email, display_name, avatar_url, created_at
            `;
            console.log('✅ Google user saved:', googleEmail);
        } else {
            return res.status(400).json({ error: 'Either phone number or Google ID required' });
        }

        res.status(200).json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error saving user:', error);
        res.status(500).json({
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
