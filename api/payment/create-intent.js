import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, currency = 'sgd', orderId, customerEmail } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
                orderId: orderId || `ORD-${Date.now()}`,
                customerEmail: customerEmail || 'guest'
            },
            automatic_payment_methods: {
                enabled: true, // Enables cards, wallets, etc.
            },
            description: `Gourmet Bites Order ${orderId || ''}`
        });

        console.log('✅ Payment Intent created:', paymentIntent.id);

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('❌ Stripe error:', error);
        res.status(500).json({
            error: error.message,
            type: error.type
        });
    }
}
