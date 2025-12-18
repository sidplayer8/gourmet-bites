
        const supabaseUrl = 'https://pklaofjfpcrlgevxkozy.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbGFvZmpmcGNybGdldnhrb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjY1MDcsImV4cCI6MjA4MDg0MjUwN30.sNg6OVLocM1D-bG9LXTlDSsy6s74oW1SQ89QWCMbOKE';
        let _supabase;

        try {
            _supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        } catch (e) {
            console.error('Supabase Init Fail', e);
            document.body.innerHTML = '<h3 style="color:white; padding:20px;">Error initializing database connection.</h3>';
        }

        // --- AUTH & INIT ---
        (async function checkAdminAccess() {
            // 1. Session Check
            const { data: { session } } = await _supabase.auth.getSession();
            let user = session?.user;

            // 2. LocalStorage Fallback
            if (!user) {
                const localAdmin = JSON.parse(localStorage.getItem('adminUser'));
                const localUser = JSON.parse(localStorage.getItem('user'));
                user = localAdmin || localUser;
            }

            if (!user || (!user.id && !user.uid)) {
                window.location.href = 'login.html';
                return;
            }

            const uEmail = user.email || (user.user && user.user.email);
            const uPhone = user.phone || (user.user && user.user.phone);

            // 3. Allowlist (The Bypass)
            const allowed = ['sapsinfocomm22@gmail.com', '+6590214181'];
            if (allowed.includes(uEmail) || allowed.includes(uPhone)) {
                document.getElementById('adminName').textContent = `Owner (${uEmail || uPhone})`;
                showSection('dashboard');
                return;
            }
            // 4. DB Check
            // We use user.id (UUID) or try to find by email/phone if user.id fails
            // For now, strict check on user.id is safest for standard flow
            if (user.id) {
                const { data: staff } = await _supabase.from('staff').select('*, roles(name)').eq('user_id', user.id).single();
                if (staff) {
                    document.getElementById('adminName').textContent = `${staff.roles?.name || 'Staff'} (${staff.name || uEmail})`;
                    return;
                }
            }

            // If we got here, access denied
            window.location.href = 'menu.html';
        })(); // Invoke the IIFE

        async function logout() {
            await _supabase.auth.signOut();
            localStorage.clear();
            window.location.href = 'login.html';
        }

        function toggleSidebar() {
            document.querySelector('.sidebar').classList.toggle('open');
            document.querySelector('.sidebar-overlay').classList.toggle('active');
        }

        function showSection(sectionId) {
            // Auto-close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('open');
                document.querySelector('.sidebar-overlay').classList.remove('active');
            }

            // Sidebar UI
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('active');
                if (el.textContent.toLowerCase().includes(sectionId)) el.classList.add('active');
            });

            // Content UI
            document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
            const target = document.getElementById(`${sectionId}-section`);
            if (target) target.classList.add('active');

            // Header
            document.getElementById('pageTitle').textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

            // Fetch Data
            if (sectionId === 'dashboard') fetchStats();
            if (sectionId === 'orders') fetchOrders();
            if (sectionId === 'history') fetchHistory();
            if (sectionId === 'menu') fetchMenu();
            if (sectionId === 'staff') fetchStaff();
            if (sectionId === 'roles') fetchRoles();
            if (sectionId === 'tables') fetchTables();
        }

        // --- TABLES ---
        async function fetchTables() {
            const container = document.getElementById('tablesGrid');
            const { data, error } = await _supabase.from('restaurant_tables').select('*').order('table_number');

            if (error) { container.textContent = 'Error loading tables'; return; }
            if (!data || !data.length) {
                container.innerHTML = '<p>No tables found. Click "Reset/Init" to create them.</p>';
                return;
            }

            container.innerHTML = data.map(t => {
                const isFree = t.status === 'available';
                const color = isFree ? 'var(--success)' : 'var(--danger)';

                return `
                <div onclick="toggleTable('${t.id}', '${t.status}')" style="
                    background: ${isFree ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; 
                    border: 2px solid ${color}; 
                    border-radius: 12px; 
                    padding: 20px; 
                    text-align: center; 
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="font-size:24px; font-weight:bold; color:white;">T-${t.table_number}</div>
                    <div style="margin-top:5px; color:${color}; font-size:14px; font-weight:bold;">${t.status.toUpperCase()}</div>
                </div>`;
            }).join('');
        }

        async function toggleTable(id, currentStatus) {
            const newStatus = currentStatus === 'available' ? 'taken' : 'available';
            await _supabase.from('restaurant_tables').update({ status: newStatus }).eq('id', id);
            fetchTables();
        }

        async function initTables() {
            document.getElementById('confirmModal').style.display = 'flex';
        }

        function closeConfirmModal() {
            document.getElementById('confirmModal').style.display = 'none';
        }

        async function confirmInitTables() {
            closeConfirmModal();
            const seeds = Array.from({ length: 10 }, (_, i) => ({ table_number: i + 1, status: 'available' }));
            const { error } = await _supabase.from('restaurant_tables').upsert(seeds, { onConflict: 'table_number' });
            if (error) {
                console.error('Error creating tables:', error);
                showToast('Error creating tables. Check console for details.', 'error');
            } else {
                showToast('✓ Tables created successfully!', 'success');
                fetchTables();
            }
        }

        async function updateOrderStatus(id, newStatus) {
            const { data, error } = await _supabase.from('orders').update({ status: newStatus }).eq('id', id).select().single();
            if (error) {
                console.error('Error updating order:', error);
                showToast('Failed to update order status', 'error');
                return;
            }

            // If order is done/cancelled, free up the table
            if (newStatus === 'completed' || newStatus === 'cancelled') { // Changed 'done' to 'completed' to match existing status
                if (data.table_id) {
                    await _supabase.from('restaurant_tables')
                        .update({ status: 'available', current_order_id: null })
                        .eq('id', data.table_id);
                    fetchTables(); // Refresh table view
                }
            }

            fetchOrders();
            showToast(`Order #${id.slice(0, 8)} marked as ${newStatus}`, 'success');
        }

        // --- HISTORY ---
        async function fetchHistory() {
            const container = document.getElementById('historyList');
            const filter = document.getElementById('historyFilter').value;

            let query = _supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);

            if (filter === 'completed') {
                query = query.eq('status', 'completed');
            } else if (filter === 'cancelled') {
                query = query.eq('status', 'cancelled');
            } else {
                // All non-pending
                query = query.in('status', ['completed', 'cancelled']);
            }

            const { data: orders, error } = await query;

            if (error || !orders) {
                container.innerHTML = '<p>Error loading history</p>';
                return;
            }

            if (orders.length === 0) {
                container.innerHTML = '<p style="color:#666; text-align:center; padding:40px;">No completed orders yet.</p>';
                return;
            }

            container.innerHTML = orders.map(o => {
                let items = [];
                try { items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items; } catch (e) { }
                const itemsStr = Array.isArray(items) ? items.map(i => `${i.quantity}x ${i.name}`).join(', ') : '';
                const statusColor = o.status === 'completed' ? 'var(--success)' : '#666';
                const tableBadge = o.table_number ? `<span style="background:#3b82f6; color:white; padding:2px 6px; border-radius:4px; font-size:12px; margin-left:8px;">Table ${o.table_number}</span>` : '';
                const date = new Date(o.created_at);

                return `
                <div class="stat-card" style="margin-bottom:10px; border-left:4px solid ${statusColor}; opacity:0.8;">
                    <div style="display:flex; justify-content:space-between;">
                        <div>
                            <strong>#${o.id.slice(0, 8)}...</strong> ${tableBadge} 
                            <span style="background:${statusColor}; color:white; padding:2px 8px; border-radius:4px; font-size:11px; margin-left:8px;">${o.status.toUpperCase()}</span>
                            <br>
                            <small>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</small><br>
                            <div style="margin-top:5px; font-size:14px; color:#ccc;">${itemsStr}</div>
                            ${o.custom_notes ? `<div style="margin-top:5px; font-size:12px; color:#aaa;">📝 ${o.custom_notes}</div>` : ''}
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:18px; font-weight:bold;">$${Number(o.total_price || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        // --- STATS ---
        async function fetchStats() {
            try {
                const { count } = await _supabase.from('orders').select('*', { count: 'exact', head: true });
                document.getElementById('stat-total-orders').textContent = count || 0;

                // Count tables that are currently 'taken'
                const { data: takenTables, error } = await _supabase
                    .from('restaurant_tables')
                    .select('id, status')
                    .eq('status', 'taken');

                if (error) {
                    console.error('Error fetching active tables:', error);
                } else {
                    console.log('Active tables query result:', takenTables);
                    document.getElementById('stat-active-tables').textContent = takenTables?.length || 0;
                }

                const { data: orders } = await _supabase.from('orders').select('total_price');
                const sum = orders?.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0) || 0;
                document.getElementById('stat-revenue').textContent = '$' + sum.toFixed(2);
            } catch (err) {
                console.error('fetchStats error:', err);
            }
        }

        // --- ORDERS ---
        async function fetchOrders() {
            const container = document.getElementById('ordersList');
            container.innerHTML = 'Loading...';
            // Fetch all, but we will filter client-side for now or we can filter DB side.
            const { data, error } = await _supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (error) { container.textContent = 'Error: ' + error.message; return; }

            if (!data.length) { container.innerHTML = '<p>No orders.</p>'; return; }

            // Calc Stats (Keep calculating from ALL data)
            document.getElementById('stat-total-orders').textContent = data.length;
            const revenue = data.reduce((acc, o) => acc + (o.total_price || 0), 0);
            document.getElementById('stat-revenue').textContent = '$' + revenue.toFixed(2);

            // Filter for Display
            const showingHistory = document.getElementById('showHistoryCb').checked;
            const activeOrders = data.filter(o => {
                if (showingHistory) return o.status === 'completed' || o.status === 'cancelled';
                return o.status === 'pending';
            });

            if (activeOrders.length === 0) {
                const msg = showingHistory ? "No history yet." : "No pending orders. All caught up! 🎉";
                container.innerHTML = `<p style="padding:20px; color:#aaa;">${msg}</p>`;
                return;
            }

            container.innerHTML = activeOrders.map(o => {
                let items = [];
                try { items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items; } catch (e) { }
                const itemsStr = Array.isArray(items) ? items.map(i => `${i.quantity}x ${i.name}`).join(', ') : '';
                // Since we only show pending, color is always generic or specific for pending
                const color = '#ffb020';
                const tableBadge = o.table_number ? `<span style="background:#3b82f6; color:white; padding:2px 6px; border-radius:4px; font-size:12px; margin-left:8px;">Table ${o.table_number}</span>` : '';

                return `
                <div class="stat-card" style="margin-bottom:10px; border-left:4px solid ${color};">
                    <div style="display:flex; justify-content:space-between;">
                        <div>
                            <strong>#${o.id.slice(0, 8)}...</strong> ${tableBadge} <small>${new Date(o.created_at).toLocaleTimeString()}</small><br>
                            <div style="margin-top:5px; font-size:15px; color:white;">${itemsStr}</div>
                            ${o.custom_notes ? `<div style="margin-top:5px; font-size:12px; color:#aaa;">📝 ${o.custom_notes}</div>` : ''}
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:18px; font-weight:bold;">$${Number(o.total_price || 0).toFixed(2)}</div>
                            <div style="margin-top:10px;">
                                <button style="background:var(--success); color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold;" onclick="updateOrder('${o.id}', 'completed')">DONE</button>
                                <button style="background:var(--card-bg); border:1px solid #444; color:#aaa; padding:8px 12px; border-radius:4px; cursor:pointer;" onclick="updateOrder('${o.id}', 'cancelled')">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        async function updateOrder(id, status) {
            // REMOVED 'confirm' dialog (The "Black Box")
            // Instant update
            await _supabase.from('orders').update({ status }).eq('id', id);
            fetchOrders(); // Refresh list -> Order will disappear
        }

        // --- STAFF ---
        async function fetchStaff() {
            const container = document.getElementById('staffTableContainer');
            /* 
              This query relies on foreign key logic. 
              If 'roles' table exists and FK is set up: .select('*, roles(name)')
            */
            const { data, error } = await _supabase.from('staff').select('*, roles(name)');

            if (error) {
                container.innerHTML = `<p style="color:red">Error: ${error.message}. Make sure 'roles' relationship exists.</p>`;
                return;
            }

            let html = `<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr></thead><tbody>`;
            html += data.map(s => `
                <tr>
                    <td>${s.name || 'Unset'}</td>
                    <td>${s.email || '-'}</td>
                    <td>${s.phone || '-'}</td>
                    <td><span style="background:#334; padding:2px 6px; border-radius:4px;">${s.roles?.name || s.role_id}</span></td>
                    <td>
                        <button onclick="deleteStaff('${s.id}')" style="color:var(--danger); background:none; border:none; cursor:pointer;">Remove</button>
                    </td>
                </tr>
            `).join('');
            html += '</tbody></table>';
            container.innerHTML = html;
        }

        async function deleteStaff(id) {
            if (confirm('Remove access for this staff member?')) {
                await _supabase.from('staff').delete().eq('id', id);
                fetchStaff();
            }
        }

        // --- ROLES ---
        async function fetchRoles() {
            const container = document.getElementById('rolesList');
            const { data, error } = await _supabase.from('roles').select('*');
            if (error) { container.textContent = 'Error loading roles'; return; }

            container.innerHTML = data.map(r => `
                <div style="background:#2a3040; padding:10px; margin-bottom:5px; border-radius:8px; display:flex; justify-content:space-between;">
                    <strong>${r.name}</strong>
                    <small>ID: ${r.id}</small>
                </div>
            `).join('');
        }

        // --- MODALS (Enhanced) ---
        function openMenuModal(id) {
            const modal = document.getElementById('menuModal');
            const item = id ? window._menuData.find(i => i.id == id) : {};

            document.getElementById('modalTitle').textContent = id ? 'Edit Menu Item' : 'Add New Item';
            document.getElementById('editItemId').value = id || '';
            document.getElementById('itemName').value = item.name || '';
            document.getElementById('itemPrice').value = item.price || '';
            document.getElementById('itemCat').value = item.category || 'Mains';
            document.getElementById('itemImg').value = item.image_url || '';

            modal.style.display = 'flex';
        }

        function closeMenuModal() {
            document.getElementById('menuModal').style.display = 'none';
        }

        async function saveMenuItem() {
            const id = document.getElementById('editItemId').value;
            const name = document.getElementById('itemName').value;
            const price = parseFloat(document.getElementById('itemPrice').value);
            const category = document.getElementById('itemCat').value;
            const image_url = document.getElementById('itemImg').value;

            if (!name || isNaN(price)) { alert('Please enter valid name and price'); return; }

            const payload = { name, price, category, image_url };

            if (id) {
                await _supabase.from('menu_items').update(payload).eq('id', id);
            } else {
                await _supabase.from('menu_items').insert([payload]);
            }

            closeMenuModal();
            fetchMenuItems();
        }

        function openStaffModal() {
            // Add Staff Logic
            // We ask for Name, Email OR Phone, and Role ID
            const name = prompt("Staff Name:");
            if (!name) return;
            const contact = prompt("Email OR Phone (e.g. +65...):");
            if (!contact) return;
            const roleId = prompt("Role ID (1=Owner, 2=Manager, 3=Staff, 4=Chef):", "3");

            // Guess if email or phone
            const isEmail = contact.includes('@');
            const payload = {
                name: name,
                role_id: parseInt(roleId),
                email: isEmail ? contact : null,
                phone: !isEmail ? contact : null
            };

            (async () => {
                const { error } = await _supabase.from('staff').insert([payload]);
                if (error) alert('Error: ' + error.message);
                else fetchStaff();
            })();
        }

        // Expose
        window.openStaffModal = openStaffModal;
        window.deleteStaff = deleteStaff;
        window.updateOrder = updateOrder;
        window.showSection = showSection;
        window.logout = logout;

    })(); // End admin check IIFE

        // --- GLOBAL MENU FUNCTIONS (OUTSIDE IIFE) ---
        // These MUST be global so onclick handlers can access them

        function handleCategoryChange() {
            const select = document.getElementById('menuCategory');
            const customInput = document.getElementById('customCategory');
            if (select.value === '__custom__') {
                customInput.style.display = 'block';
                customInput.focus();
            } else {
                customInput.style.display = 'none';
            }
        }

        function openMenuModal(itemId = null) {
            console.log('openMenuModal called with itemId:', itemId);
            const modal = document.getElementById('menuModal');
            const title = document.getElementById('menuModalTitle');

            console.log('Modal element:', modal);
            console.log('Title element:', title);

            if (!modal || !title) {
                console.error('Modal or title not found!', { modal, title });
                return;
            }

            // Reset form
            document.getElementById('menuItemId').value = '';
            document.getElementById('menuName').value = '';
            document.getElementById('menuCategory').value = 'Appetizers';
            document.getElementById('customCategory').style.display = 'none';
            document.getElementById('customCategory').value = '';
            document.getElementById('menuPrice').value = '';
            document.getElementById('menuDescription').value = '';
            document.getElementById('menuImageUrl').value = '';
            document.getElementById('menuIsPublic').checked = true;
            document.getElementById('menuIsAvailable').checked = true;

            if (itemId) {
                // Edit mode
                title.textContent = 'Edit Menu Item';
                document.getElementById('menuItemId').value = itemId;

                // Find item in cache
                const item = window._menuData?.find(i => i.id == itemId);
                if (item) {
                    document.getElementById('menuName').value = item.name || '';
                    document.getElementById('menuCategory').value = item.category || 'Appetizers';
                    document.getElementById('menuPrice').value = item.price || '';
                    document.getElementById('menuDescription').value = item.description || '';
                    document.getElementById('menuImageUrl').value = item.image_url || '';
                    document.getElementById('menuIsPublic').checked = item.is_public !== false;
                    document.getElementById('menuIsAvailable').checked = item.is_available !== false;
                }
            } else {
                // Add mode
                title.textContent = 'Add Menu Item';
            }

            console.log('About to show modal...');
            modal.classList.add('show');
            console.log('Modal shown');
        }

        function closeMenuModal() {
            const modal = document.getElementById('menuModal');
            modal.classList.remove('show');
        }

        async function saveMenuItem() {
            const id = document.getElementById('menuItemId').value;
            const name = document.getElementById('menuName').value.trim();
            const categorySelect = document.getElementById('menuCategory').value;
            const customCat = document.getElementById('customCategory').value.trim();
            const category = categorySelect === '__custom__' ? customCat : categorySelect;
            const price = parseFloat(document.getElementById('menuPrice').value) || 0;
            const description = document.getElementById('menuDescription').value.trim();
            const imageUrl = document.getElementById('menuImageUrl').value.trim();
            const isPublic = document.getElementById('menuIsPublic').checked;
            const isAvailable = document.getElementById('menuIsAvailable').checked;

            if (!name) {
                alert('Please enter item name');
                return;
            }
            if (!category) {
                alert('Please select or create a category');
                return;
            }

            const payload = {
                name,
                category,
                price,
                description: description || null,
                image_url: imageUrl || null,
                is_public: isPublic,
                is_available: isAvailable
            };

            try {
                if (id) {
                    // Update
                    const { error } = await _supabase
                        .from('menu_items')
                        .update(payload)
                        .eq('id', id);
                    if (error) throw error;
                } else {
                    // Insert
                    const { error } = await _supabase
                        .from('menu_items')
                        .insert(payload);
                    if (error) throw error;
                }

                closeMenuModal();
                // Need to expose fetchMenu too!
                if (typeof window.fetchMenuGlobal === 'function') {
                    window.fetchMenuGlobal();
                }
            } catch (err) {
                console.error('Save error:', err);
                alert('Failed to save: ' + err.message);
            }
        }

        async function deleteMenuItem(itemId) {
            if (!confirm('Delete this menu item?')) return;

            try {
                const { error } = await _supabase
                    .from('menu_items')
                    .delete()
                    .eq('id', itemId);

                if (error) throw error;

                if (typeof window.fetchMenuGlobal === 'function') {
                    window.fetchMenuGlobal();
                }
            } catch (err) {
                console.error('Delete error:', err);
                alert('Failed to delete: ' + err.message);
            }
        }

        // Expose to window
        window.openMenuModal = openMenuModal;
        window.closeMenuModal = closeMenuModal;
        window.saveMenuItem = saveMenuItem;
        window.deleteMenuItem = deleteMenuItem;
        window.handleCategoryChange = handleCategoryChange;
    
