// Populate dashboard with personalized stats based on role
async function populateDashboard(role, name, staffData) {
    console.log('📊 Populating dashboard for:', role, name);

    try {
        const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

        // Helper to safely set element text
        const safeSet = (id, text) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = text;
            } else {
                console.warn(`Element not found: ${id}`);
            }
        };

        // Update welcome message
        safeSet('welcomeMessage', `👋 Good ${timeOfDay}, ${name}!`);
        safeSet('welcomeSubtext', `Here's your ${role} dashboard`);

        // Get stats based on role
        if (role === 'Owner' || role === 'Manager') {
            safeSet('stat1-label', "Today's Orders");
            safeSet('stat1-value', '0');
            safeSet('stat2-label', 'Revenue');
            safeSet('stat2-value', '$0.00');
            safeSet('stat3-label', 'Active Staff');
            safeSet('stat3-value', '0');
            safeSet('stat4-label', 'Completion Rate');
            safeSet('stat4-value', '0%');
        } else if (role === 'Server') {
            safeSet('stat1-label', 'Orders Taken');
            safeSet('stat1-value', '0');
            safeSet('stat2-label', 'Tables Served');
            safeSet('stat2-value', '0');
            safeSet('stat3-label', 'Avg Response Time');
            safeSet('stat3-value', '-');
            safeSet('stat4-label', 'Customer Rating');
            safeSet('stat4-value', '⭐ -');
        } else if (role === 'Chef') {
            safeSet('stat1-label', 'Dishes Completed');
            safeSet('stat1-value', '0');
            safeSet('stat2-label', 'Pending Orders');
            safeSet('stat2-value', '0');
            safeSet('stat3-label', 'Avg Prep Time');
            safeSet('stat3-value', '-');
            safeSet('stat4-label', 'On-Time Rate');
            safeSet('stat4-value', '0%');
        } else {
            safeSet('stat1-label', 'Hours This Week');
            safeSet('stat1-value', '0h');
            safeSet('stat2-label', 'Tasks Completed');
            safeSet('stat2-value', '0');
            safeSet('stat3-label', 'Upcoming Shifts');
            safeSet('stat3-value', '0');
            safeSet('stat4-label', 'Performance');
            safeSet('stat4-value', '100%');
        }

        // Update recent activity
        const activityEl = document.getElementById('recentActivity');
        if (activityEl) {
            activityEl.innerHTML = `
                <p style="color:#666; font-size:14px;">• Logged in at ${new Date().toLocaleTimeString()}</p>
                <p style="color:#666; font-size:14px;">• No recent activity</p>
            `;
        } else {
            console.warn('recentActivity element not found');
        }

        console.log('✅ Dashboard populated successfully');
    } catch (error) {
        console.error('❌ Error populating dashboard:', error);
    }
}
