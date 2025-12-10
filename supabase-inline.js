// Supabase client configuration - inline version (no modules)
const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

// Initialize Supabase (using CDN)
let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
    const { createClient } = supabase;
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    // Expose as global for other scripts to use
    window._supabase = supabaseClient;
    console.log('Supabase client initialized successfully');
} else {
    console.warn('Supabase CDN not loaded yet');
}

// Helper function to get menu items
async function getMenuItems() {
    if (!supabaseClient) {
        console.warn('Supabase client not available, using fallback data');
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('menu_items')
            .select('*')
            .eq('available', true)
            .order('name');

        if (error) {
            console.error('Error fetching menu:', error);
            return [];
        }
        console.log('Loaded', data.length, 'items from database');
        return data;
    } catch (err) {
        console.error('Exception fetching menu:', err);
        return [];
    }
}
