// Supabase client configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase credentials - connected to gourmet-bites database
const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions
export async function getMenuItems() {
    const { data, error } = await supabase
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

export async function createOrder(orderData) {
    const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

    if (error) {
        console.error('Error creating order:', error);
        throw error;
    }
    return data;
}

export async function getUserOrders(userId) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
    return data;
}
