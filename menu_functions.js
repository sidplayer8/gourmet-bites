// Menu Management Functions with Permissions Built-in
async function openMenuModal(itemId = null) {
    // Permission check
    const perm = itemId ? PERMISSIONS.EDIT_MENU : PERMISSIONS.CREATE_MENU;
    const action = itemId ? 'edit menu items' : 'create menu items';
    if (!requirePermission(perm, action)) return;

    const modal = document.getElementById('menuModal');
    const title = document.getElementById('menuModalTitle');

    // Reset form
    document.getElementById('menuItemId').value = '';
    document.getElementById('menuName').value = '';
    document.getElementById('menuPrice').value = '';
    document.getElementById('menuDescription').value = '';
    document.getElementById('menuImageUrl').value = '';
    document.getElementById('menuIsPublic').checked = true;
    document.getElementById('menuIsAvailable').checked = true;

    if (itemId) {
        title.textContent = 'Edit Menu Item';
        // Fetch and populate item data
        const { data: item } = await _supabase.from('menu_items').select('*').eq('id', itemId).single();
        if (item) {
            document.getElementById('menuItemId').value = item.id;
            document.getElementById('menuName').value = item.name;
            document.getElementById('menuPrice').value = item.price;
            document.getElementById('menuDescription').value = item.description || '';
            document.getElementById('menuImageUrl').value = item.image_url || '';
            document.getElementById('menuCategory').value = item.category;
            document.getElementById('menuIsPublic').checked = item.is_public;
            document.getElementById('menuIsAvailable').checked = item.is_available;
        }
    } else {
        title.textContent = 'Add Menu Item';
    }

    modal.style.display = 'flex';
}

function closeMenuModal() {
    document.getElementById('menuModal').style.display = 'none';
}

async function saveMenuItem() {
    const id = document.getElementById('menuItemId').value;
    const name = document.getElementById('menuName').value.trim();
    const price = parseFloat(document.getElementById('menuPrice').value);
    const category = document.getElementById('menuCategory').value;
    const description = document.getElementById('menuDescription').value.trim();
    const imageUrl = document.getElementById('menuImageUrl').value.trim();
    const isPublic = document.getElementById('menuIsPublic').checked;
    const isAvailable = document.getElementById('menuIsAvailable').checked;

    if (!name || !price || !category) {
        alert('Please fill in required fields');
        return;
    }

    const itemData = {
        name,
        price,
        category,
        description,
        image_url: imageUrl,
        is_public: isPublic,
        is_available: isAvailable
    };

    try {
        if (id) {
            // Update existing
            if (!hasPermission(PERMISSIONS.EDIT_MENU)) {
                showAccessDeniedModal('edit menu items');
                return;
            }
            const { error } = await _supabase.from('menu_items').update(itemData).eq('id', id);
            if (error) throw error;
            showToast('Menu item updated successfully', 'success');
        } else {
            // Create new
            if (!hasPermission(PERMISSIONS.CREATE_MENU)) {
                showAccessDeniedModal('create menu items');
                return;
            }
            const { error } = await _supabase.from('menu_items').insert([itemData]);
            if (error) throw error;
            showToast('Menu item created successfully', 'success');
        }

        closeMenuModal();
        fetchMenu();
    } catch (err) {
        console.error('Save menu item error:', err);
        alert('Failed to save menu item: ' + err.message);
    }
}

async function deleteMenuItem(id) {
    // Permission check
    if (!requirePermission(PERMISSIONS.DELETE_MENU, 'delete menu items')) return;

    showConfirmDialog(
        'Delete Menu Item?',
        'Are you sure you want to delete this menu item?',
        async () => {
            const { error } = await _supabase.from('menu_items').delete().eq('id', id);
            if (error) {
                showToast('Failed to delete item', 'error');
            } else {
                showToast('Menu item deleted successfully', 'success');
                fetchMenu();
            }
        }
    );
}

async function fetchMenu() {
    const container = document.getElementById('menuTableContainer');
    const { data: items, error } = await _supabase.from('menu_items').select('*').order('category', { ascending: true });

    if (error) {
        container.innerHTML = `<p style="color:red">Error loading menu: ${error.message}</p>`;
        return;
    }

    if (!items || items.length === 0) {
        container.innerHTML = '<p style="color:#999">No menu items yet. Add one to get started!</p>';
        return;
    }

    let html = '<table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>';

    items.forEach(item => {
        const status = !item.is_available ? '🔴 Unavailable' : !item.is_public ? '🔒 Hidden' : '✅ Available';
        html += `
            <tr>
                <td>${item.name}</td>
                <td><span style="background:#334;padding:2px 6px;border-radius:4px;">${item.category}</span></td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${status}</td>
                <td>
                    ${hasPermission(PERMISSIONS.EDIT_MENU) ? `<button onclick="openMenuModal('${item.id}')" style="color:#10b981;background:none;border:none;cursor:pointer;margin-right:12px;font-weight:500;">Edit</button>` : ''}
                    ${hasPermission(PERMISSIONS.DELETE_MENU) ? `<button onclick="deleteMenuItem('${item.id}')" style="color:var(--danger);background:none;border:none;cursor:pointer;font-weight:500;">Delete</button>` : ''}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function handleCategoryChange() {
    const select = document.getElementById('menuCategory');
    const customInput = document.getElementById('customCategory');

    if (select.value === '__custom__') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}
