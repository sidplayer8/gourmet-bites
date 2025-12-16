
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log("--- Testing Order Update ---");

    // 1. Get a pending order
    const { data: orders } = await supabase.from('orders').select('id, status').eq('status', 'pending').limit(1);

    if (!orders || orders.length === 0) {
        console.log("No pending orders found to test.");
        return;
    }

    const orderId = orders[0].id;
    console.log(`Attempting to update Order ID: ${orderId}`);

    // 2. Try to update it
    const { data, error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)
        .select();

    if (error) {
        console.error("❌ Update FAILED:", error);
        console.error("Likely Cause: Row Level Security (RLS) policy prevents UPDATE.");
    } else {
        console.log("✅ Update SUCCESS:", data);
        // Revert it back so we don't mess up user data too much
        await supabase.from('orders').update({ status: 'pending' }).eq('id', orderId);
        console.log("Reverted status to pending.");
    }
}

testUpdate();
