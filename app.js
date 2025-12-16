// Check auth
const urlParams = new URLSearchParams(window.location.search);
const tableParam = urlParams.get('table');

if (tableParam) {
    sessionStorage.setItem('pendingTable', tableParam);
}

if (!localStorage.getItem('user')) {
    window.location.href = 'login.html';
} else {
    // User is logged in. 
    // If we have a pending table in session (from pre-login scan) or URL, ensure it persists
    // If URL is missing table but we have it in storage, we might want to add it.

    let currentTable = tableParam || sessionStorage.getItem('pendingTable') || localStorage.getItem('activeTable');

    if (currentTable) {
        localStorage.setItem('activeTable', currentTable);
        // Ensure URL reflects it
        if (!tableParam) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('table', currentTable);
            window.history.replaceState({}, '', newUrl);
        }
    }
}
function logout() { localStorage.removeItem('user'); localStorage.removeItem('cart'); localStorage.removeItem('orders'); window.location.href = 'login.html'; }


// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'error' ? 'error' : type === 'info' ? 'info' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Update cart count with animation
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.transform = 'scale(1.4)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
}


let menuItems = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

let currentCategory = 'All';

function loadMenu() {
    getMenuItems().then(rawMenuItems => {
        // Normalize data from Supabase
        menuItems = rawMenuItems.map(item => ({
            ...item,
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : (item.ingredients ? [item.ingredients] : []),
            allergens: Array.isArray(item.allergens) ? item.allergens : (item.allergens ? [item.allergens] : []),
            price: Number(item.price) // Ensure price is a number
        }));

        if (menuItems.length === 0) {
            // Fallback (omitted for brevity, keeping existing fallback logic if needed)
            // For now assuming database has items or user ran the SQL
            menuItems = [
                // Fallback items with categories added for testing even without DB update
                { id: 1, name: 'Classic Burger', category: 'Burgers', price: 11.99, description: 'Juicy beef patty', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', allergens: ['Gluten'], ingredients: ['Beef', 'Bun'] },
                { id: 2, name: 'Margherita Pizza', category: 'Pizza', price: 12.99, description: 'Fresh mozzarella', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', allergens: ['Gluten'], ingredients: ['Dough', 'Cheese'] }
            ];
        }

        console.log('Menu loaded:', menuItems.length, 'items');
        renderMenu(); // Initial render (All)
        updateCartCount();
    }).catch(error => {
        console.error('Error loading menu:', error);
        showToast('Error loading menu', 'error');
    });
}

function filterMenu(category) {
    currentCategory = category;

    // Update active button state
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.textContent.trim() === category || (category === 'Appetizers' && btn.textContent.trim() === 'Sides')) {
            btn.classList.add('active');
            btn.style.color = '#fff';
            btn.style.background = '#ff6600';
        } else {
            btn.classList.remove('active');
            btn.style.color = '#999';
            btn.style.background = 'none';
        }
    });

    renderMenu();
}

function renderMenu() {
    const grid = document.getElementById('menuView');
    if (!grid) return;

    // Filter items
    const filteredItems = currentCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === currentCategory);

    if (filteredItems.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px; color:#999;">No items found in ${currentCategory}</p>`;
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <div class="menu-card" style="animation: fadeIn 0.3s ease-in-out;">
            <img src="${item.image_url || item.img}" alt="${item.name}">
            <div class="menu-card-body">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3>${item.name}</h3>
                    <span style="font-size:12px; background:#333; padding:2px 6px; border-radius:4px; color:#aaa;">${item.category || 'Mains'}</span>
                </div>
                <p>${item.description || item.desc}</p>
                ${item.allergens && item.allergens.length > 0 ? `<div class="allergens">⚠️ ${item.allergens.join(', ')}</div>` : ''}
                <div class="price">$${item.price.toFixed(2)}</div>
                <button class="btn-add" data-item-id="${item.id}">Add to Cart</button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    grid.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-item-id');
            openCustomizeModal(itemId);
        });
    });

    updateCartCount();
}

function openCustomizeModal(itemId) {
    const item = menuItems.find(i => i.id == itemId); // Use == to support UUID strings and integers
    if (!item) {
        console.error('Item not found:', itemId);
        showToast('Error: Item not found', 'error');
        return;
    }

    // Ensure ingredients and allergens are arrays
    const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
    const allergens = Array.isArray(item.allergens) ? item.allergens : [];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Customize ${item.name}</h2>
                <button class="modal-close" data-action="close">×</button>
            </div>
            <div class="modal-body">
                <img src="${item.image_url || item.img}" alt="${item.name}" style="width:100%; height:200px; object-fit:cover; border-radius:12px; margin-bottom:20px;">
                <p style="color:#999; margin-bottom:20px;">${item.description || item.desc}</p>
                
                <h3 style="margin-bottom:10px;">Ingredients</h3>
                <div class="ingredients-list">
                    ${ingredients.length > 0 ? ingredients.map((ing, idx) => `
                        <label class="ingredient-item" style="display:flex; align-items:center; padding:10px; margin-bottom:8px; background:#2a2a3e; border-radius:8px;">
                            <input type="checkbox" checked data-ingredient="${idx}" style="margin-right:12px; width:20px; height:20px;">
                            <span style="flex:1;">${ing}</span>
                        </label>
                    `).join('') : '<p style="color:#999;">No customization available</p>'}
                </div>
                
                <h3 style="margin-top:20px; margin-bottom:10px;">Special Instructions</h3>
                <textarea id="specialNotes" placeholder="E.g., No onions, extra sauce..." style="width:100%; padding:12px; background:#2a2a3e; border:1px solid #444; border-radius:8px; color:#fff; min-height:80px; resize:vertical;"></textarea>
                
                ${allergens.length > 0 ? `
                    <div class="allergen-warning" style="background:#ef4444; color:white; padding:12px; border-radius:8px; margin-top:20px;">
                        <strong>⚠️ Allergens:</strong> ${allergens.join(', ')}
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn-primary" data-action="add" data-item-id="${itemId}">Add to Cart - $${item.price.toFixed(2)}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Add event listeners to modal buttons
    modal.querySelector('[data-action="close"]').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-action="add"]').addEventListener('click', () => {
        addCustomizedItem(itemId);
    });
}

function addCustomizedItem(itemId) {
    console.log('Adding item to cart:', itemId);

    try {
        const item = menuItems.find(i => i.id == itemId); // Use == to support UUID strings and integers
        if (!item) {
            console.error('Item not found in menuItems:', itemId);
            showToast('Error: Item not found', 'error');
            return;
        }

        const modal = document.querySelector('.modal-overlay');
        if (!modal) {
            console.error('Modal not found');
            showToast('Error: Modal not found', 'error');
            return;
        }

        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        const notesElement = document.getElementById('specialNotes');
        const notes = notesElement ? notesElement.value.trim() : '';

        // Safely get ingredients array
        const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];

        const removedIngredients = Array.from(checkboxes)
            .filter(cb => !cb.checked)
            .map(cb => ingredients[cb.dataset.ingredient])
            .filter(ing => ing); // Remove undefined values

        // Check if identical item exists (same item, same customizations)
        const existingItem = cart.find(cartItem =>
            cartItem.id == itemId && // Use == to support UUID strings and integers
            JSON.stringify(cartItem.customizations?.removed || []) === JSON.stringify(removedIngredients) &&
            (cartItem.customizations?.notes || '') === notes
        );

        if (existingItem) {
            // Merge: increment quantity
            existingItem.quantity++;
            console.log('Incremented existing item quantity');
        } else {
            // Add new item with customizations
            const customItem = {
                ...item,
                quantity: 1,
                customizations: {
                    removed: removedIngredients,
                    notes: notes
                }
            };
            cart.push(customItem);
            console.log('Added new item to cart');
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart saved to localStorage. Total items:', cart.length);

        // Update cart badge with animation first
        updateCartCount();

        // Show success toast
        showToast(`✓ ${item.name} added to cart!`);

        // Close modal last
        modal.remove();

    } catch (error) {
        console.error('Error adding item to cart:', error);
        showToast('Error adding item to cart', 'error');

        // Try to close modal even if there was an error
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    }
}

// Expose functions to global scope for inline onclick handlers
window.loadMenu = loadMenu;
window.filterMenu = filterMenu;
window.openCustomizeModal = openCustomizeModal;
window.addCustomizedItem = addCustomizedItem;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

function removeFromCart(idx) {
    cart.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount(); // Update badge when item removed
}

function updateQuantity(idx, delta) {
    if (cart[idx]) {
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) {
            removeFromCart(idx);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount(); // Update badge when quantity changes
        }
    }
}

function renderCart() {
    const cartDiv = document.getElementById('cartItems');
    if (cart.length === 0) {
        cartDiv.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">Your cart is empty</p>';
        document.getElementById('cartTotal').textContent = '$0.00';
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartDiv.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
            <img src="${item.image_url || item.img}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
                ${item.customizations && item.customizations.removed.length > 0 ? `<p style="font-size:12px; color:#ff6600;">No: ${item.customizations.removed.join(', ')}</p>` : ''}
                ${item.customizations && item.customizations.notes ? `<p style="font-size:12px; color:#999;">Note: ${item.customizations.notes}</p>` : ''}
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${idx}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${idx}, 1)">+</button>
            </div>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="btn-remove" onclick="removeFromCart(${idx})">×</button>
        </div>
    `).join('');
    document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
}



function showView(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (view === 'menu') {
        document.getElementById('menuView').style.display = 'grid';
        document.getElementById('cartView').style.display = 'none';
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
    } else if (view === 'cart') {
        document.getElementById('menuView').style.display = 'none';
        document.getElementById('cartView').style.display = 'block';
        renderCart();
        document.querySelectorAll('.nav-btn')[1].classList.add('active');
    }
}

// Toggle Cart Modal/Page
function toggleCart() {
    const cartPage = document.getElementById('cart-page');
    const menuContainer = document.getElementById('menu-container');
    const categoryNav = document.querySelector('.category-nav'); // Select the nav

    if (cartPage.classList.contains('hidden')) {
        // Show Cart
        cartPage.classList.remove('hidden');
        menuContainer.classList.add('hidden');
        if (categoryNav) categoryNav.style.display = 'none'; // Hide nav
        renderCart();
    } else {
        // Show Menu
        cartPage.classList.add('hidden');
        menuContainer.classList.remove('hidden');
        if (categoryNav) categoryNav.style.display = 'flex'; // Show nav again
    }
}

// Table Check on Load
function checkTableStatus() {
    const activeTable = localStorage.getItem('activeTable');
    if (!activeTable) {
        document.getElementById('tableModal').style.display = 'flex';
    } else {
        document.getElementById('tableModal').style.display = 'none';
        // Verify URL matches
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('table') !== activeTable) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('table', activeTable);
            window.history.replaceState({}, '', newUrl);
        }
    }
}

function setManualTable() {
    const val = document.getElementById('manualTableInput').value;
    if (val) {
        localStorage.setItem('activeTable', val);
        window.location.href = `menu.html?table=${val}`;
    }
}
window.setManualTable = setManualTable;

// Call on init
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', checkTableStatus);
}

// ... existing code ...

// Checkout Logic
async function checkout() {
    if (cart.length === 0) {
        showToast('Cart is empty!', 'error');
        return;
    }

    // Get User
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        showToast('Please login to order', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Get Table (Should be set by now)
    const tableNum = localStorage.getItem('activeTable');
    if (!tableNum) {
        // Fallback safety (shouldn't happen if modal blocks)
        checkTableStatus();
        return;
    }

    // Prepare Order Payload
    const orderData = {
        user_id: user.id,
        items: cart,
        total_price: total,
        total: total,
        status: 'pending',
        type: 'dine_in',
        table_number: tableNum,
        table_id: null,
        custom_notes: document.getElementById('orderNotes')?.value || ''
    };

    document.querySelector('.btn-checkout')?.setAttribute('disabled', 'true');
    showToast('Processing order...', 'info');

    try {
        const client = window._supabase || window.supabase;
        if (!client) throw new Error('System offline (DB connection missing)');

        const { data, error } = await client
            .from('orders')
            .insert([orderData])
            .select();

        if (error) throw error;

        showToast(`✓ Order #${data[0].id.slice(0, 8)} placed for Table ${tableNum}!`, 'success');
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();

    } catch (err) {
        console.error('Checkout error:', err);
        showToast('Failed to place order: ' + err.message, 'error');
        document.querySelector('.btn-checkout')?.removeAttribute('disabled');
    }
}

// Note: renderMenu() and updateCartCount() are now called from loadMenu() in menu.html
