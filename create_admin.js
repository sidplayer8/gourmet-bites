
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'sapsinfocomm22@gmail.com';
    const password = 'AdminGourmet123!';

    console.log(`Creating user ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: 'Admin Owner',
                role: 'admin' // Metadata
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        // If user already exists, we can't get their ID via Anon key usually.
        // But maybe sign in works?
        if (error.message.includes('already registered')) {
            console.log('User exists. Trying to sign in to get ID...');
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email, password
            });
            if (signInError) {
                console.error('Could not sign in:', signInError.message);
                process.exit(1);
            }
            console.log('USER_ID:', signInData.user.id);
            return;
        }
        process.exit(1);
    }

    if (data.user) {
        console.log('User created successfully!');
        console.log('USER_ID:', data.user.id);
    } else {
        console.error('No user data returned?');
    }
}

createAdmin();
