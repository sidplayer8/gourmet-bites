if (!localStorage.getItem('user')) { window.location.href = 'login.html'; }
function logout() { localStorage.removeItem('user'); localStorage.removeItem('cart'); localStorage.removeItem('orders'); window.location.href = 'login.html'; }

const user = JSON.parse(localStorage.getItem('user'));
document.getElementById('userName').textContent = user.name || 'User';
document.getElementById('userEmail').textContent = user.email || user.phone || '';

// Load Supabase and fetch order history
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = async () => {
    const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const historyDiv = document.getElementById('orderHistory');

    if (error || !orders || orders.length === 0) {
        historyDiv.innerHTML = '<p style="color:#666; text-align:center; padding:40px;">No orders yet. Start ordering!</p>';
        return;
    }

    historyDiv.innerHTML = orders.map(o => {
        let items = [];
        try { items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items; } catch (e) { }
        const itemsStr = Array.isArray(items) ? items.map(i => `${i.quantity}x ${i.name}`).join(', ') : '';
        const date = new Date(o.created_at);
        const statusColor = o.status === 'completed' ? '#10b981' : o.status === 'pending' ? '#ffb020' : '#666';

        return `
        <div style="background:#1a1a1a; padding:20px; border-radius:12px; margin-bottom:15px; border-left:4px solid ${statusColor};">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <div>
                    <strong style="color:white;">Order #${o.id.slice(0, 8)}</strong>
                    <span style="background:${statusColor}; color:white; padding:2px 8px; border-radius:4px; font-size:11px; margin-left:8px;">${o.status.toUpperCase()}</span>
                </div>
                <div style="color:#ff6600; font-weight:bold;">$${Number(o.total_price || 0).toFixed(2)}</div>
            </div>
            <div style="color:#999; font-size:13px; margin-bottom:8px;">${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</div>
            <div style="color:#ccc; font-size:14px;">${itemsStr}</div>
            ${o.table_number ? `<div style="color:#3b82f6; font-size:12px; margin-top:8px;">🪑 Table ${o.table_number}</div>` : ''}
        </div>`;
    }).join('');
};
document.head.appendChild(script);
