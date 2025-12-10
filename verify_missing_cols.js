
const { createClient } = require('@supabase/supabase-js');

// Hardcoded logic from admin_dashboard.html
const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    console.log('Checking columns...');

    const { data, error } = await supabase.from('orders').select('custom_notes, type, table_id').limit(1);

    if (error) {
        console.error('VERIFICATION_ERROR:', error.message);
    } else {
        console.log('VERIFICATION_SUCCESS: All columns exist.');
    }
}

verify();
