// Supabase client configuration - inline version (no modules)
const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

// Initialize Supabase (using CDN)
const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get menu items
async function getMenuItems() {
    const { data, error } = await supabaseClient
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('name');

    if (error) {
        console.error('Error fetching menu:', error);
        return [];
    }
    return data;
}
