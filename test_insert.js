
const { createClient } = require('@supabase/supabase-js');

// Hardcoded logic from admin_dashboard.html
const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Testing INSERT order...');

    // Mimic app.js payload - NOW INCLUDING TOTAL
    const payload = {
        user_id: 'test-user-id',
        items: [{ name: 'Test Burger', quantity: 1, price: 10 }],
        total_price: 10.00,
        total: 10.00, // <--- THE FIX
        status: 'pending',
        status: 'pending',
        type: 'takeaway',
        table_id: null // Valid UUID (or null)
    };

    const { data, error } = await supabase.from('orders').insert([payload]).select();

    if (error) {
        console.error('INSERT FAILED:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        console.error('Code:', error.code);
    } else {
        console.log('INSERT SUCCESS! Order ID:', data[0].id);
        // Clean up
        await supabase.from('orders').delete().eq('id', data[0].id);
    }
}

testInsert();
