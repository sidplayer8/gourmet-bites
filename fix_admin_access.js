const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAdmin() {
    console.log('Starting Admin Fix...');
    const email = 'sapsinfocomm22@gmail.com';

    // 1. Get the User ID from public.users (where login puts it)
    let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.log('User not found in public.users. Creating them now...');
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .upsert({
                email: email,
                name: 'Admin User',
                phone: '+6599999999' // Placeholder
            }, { onConflict: 'email' })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create user:', createError);
            return;
        }
        user = newUser;
    }

    console.log('Found User ID:', user.id);

    // 2. Get 'Owner' Role ID
    const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'Owner')
        .single();

    if (roleError || !role) {
        console.error('Owner role not found!');
        return;
    }
    console.log('Found Owner Role ID:', role.id);

    // 3. Upsert into Staff Table
    const { data: staff, error: staffError } = await supabase
        .from('staff')
        .upsert({
            user_id: user.id,
            role_id: role.id,
            name: user.name || 'Admin',
            email: user.email,
            status: 'active'
        }, { onConflict: 'user_id' })
        .select();

    if (staffError) {
        console.error('Failed to link staff:', staffError);
    } else {
        console.log('SUCCESS! User linked to Staff table as Owner.');
        console.log('Please log in again.');
    }
}

fixAdmin();
