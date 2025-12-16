
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
    console.log("--- Verifying Database Content ---");

    // 1. Check Orders
    const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    if (orderError) console.error("Error fetching orders:", orderError.message);
    else console.log(`✅ Orders found: ${orderCount}`);

    // 2. Check Staff
    const { count: staffCount, error: staffError } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true });

    if (staffError) console.error("Error fetching staff:", staffError.message);
    else console.log(`✅ Staff found: ${staffCount}`);

    // 3. Check Menu
    const { count: menuCount, error: menuError } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

    if (menuError) console.error("Error fetching menu:", menuError.message);
    else console.log(`✅ Menu Items found: ${menuCount}`);

    console.log("----------------------------------");
}

verifyData();
