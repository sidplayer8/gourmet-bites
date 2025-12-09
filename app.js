// Check auth
if (!localStorage.getItem('user')) { window.location.href = 'login.html'; }
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

async function loadMenu() {
    try {
        menuItems = await getMenuItems();
        if (menuItems.length === 0) {
            // Fallback to hardcoded menu if database is empty
            menuItems = [
                { id: 1, name: 'Classic Burger', price: 11.99, description: 'Juicy beef patty with fresh vegetables', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', allergens: ['Gluten', 'Dairy'], ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Cheese', 'Bun', 'Sauce'] },
                { id: 2, name: 'Margherita Pizza', price: 12.99, description: 'Fresh mozzarella, basil, tomato sauce', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', allergens: ['Gluten', 'Dairy'], ingredients: ['Pizza Dough', 'Mozzarella', 'Tomato Sauce', 'Basil', 'Olive Oil'] },
                { id: 3, name: 'Chicken Tikka', price: 14.99, description: 'Creamy Indian curry with tender chicken', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', allergens: ['Dairy'], ingredients: ['Chicken', 'Cream', 'Tikka Masala Sauce', 'Spices', 'Rice'] },
                { id: 4, name: 'Pasta Carbonara', price: 12.99, description: 'Creamy pasta with crispy bacon', image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', allergens: ['Gluten', 'Dairy', 'Eggs'], ingredients: ['Pasta', 'Bacon', 'Eggs', 'Parmesan', 'Black Pepper'] },
                { id: 5, name: 'Caesar Salad', price: 8.99, description: 'Crisp romaine with parmesan and croutons', image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', allergens: ['Gluten', 'Dairy', 'Fish'], ingredients: ['Romaine Lettuce', 'Croutons', 'Parmesan', 'Caesar Dressing'] },
                { id: 6, name: 'Greek Salad', price: 9.99, description: 'Fresh vegetables with feta cheese', image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', allergens: ['Dairy'], ingredients: ['Tomatoes', 'Cucumber', 'Feta', 'Olives', 'Red Onion'] },
                { id: 7, name: 'Pepperoni Pizza', price: 14.99, description: 'Classic pizza with pepperoni and cheese', image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', allergens: ['Gluten', 'Dairy'], ingredients: ['Pizza Dough', 'Mozzarella', 'Pepperoni', 'Tomato Sauce'] },
                { id: 8, name: 'Buffalo Wings', price: 10.99, description: 'Spicy chicken wings with hot sauce', image_url: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400', allergens: [], ingredients: ['Chicken Wings', 'Buffalo Sauce', 'Celery', 'Blue Cheese Dip'] }
            ];
        }
        renderMenu();
        updateCartCount(); // Initialize cart badge on page load
    } catch (error) {
        console.error('Error loading menu:', error);
        showToast('Error loading menu. Using offline data.', 'error');
        // Use fallback menu
        menuItems = [
            { id: 1, name: 'Classic Burger', price: 11.99, description: 'Juicy beef patty with fresh vegetables', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', allergens: ['Gluten', 'Dairy'], ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Cheese', 'Bun', 'Sauce'] },
            { id: 2, name: 'Margherita Pizza', price: 12.99, description: 'Fresh mozzarella, basil, tomato sauce', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', allergens: ['Gluten', 'Dairy'], ingredients: ['Pizza Dough', 'Mozzarella', 'Tomato Sauce', 'Basil', 'Olive Oil'] },
            { id: 3, name: 'Chicken Tikka', price: 14.99, description: 'Creamy Indian curry with tender chicken', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', allergens: ['Dairy'], ingredients: ['Chicken', 'Cream', 'Tikka Masala Sauce', 'Spices', 'Rice'] },
            { id: 4, name: 'Pasta Carbonara', price: 12.99, description: 'Creamy pasta with crispy bacon', image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', allergens: ['Gluten', 'Dairy', 'Eggs'], ingredients: ['Pasta', 'Bacon', 'Eggs', 'Parmesan', 'Black Pepper'] },
            { id: 5, name: 'Caesar Salad', price: 8.99, description: 'Crisp romaine with parmesan and croutons', image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', allergens: ['Gluten', 'Dairy', 'Fish'], ingredients: ['Romaine Lettuce', 'Croutons', 'Parmesan', 'Caesar Dressing'] },
            { id: 6, name: 'Greek Salad', price: 9.99, description: 'Fresh vegetables with feta cheese', image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', allergens: ['Dairy'], ingredients: ['Tomatoes', 'Cucumber', 'Feta', 'Olives', 'Red Onion'] },
            { id: 7, name: 'Pepperoni Pizza', price: 14.99, description: 'Classic pizza with pepperoni and cheese', image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', allergens: ['Gluten', 'Dairy'], ingredients: ['Pizza Dough', 'Mozzarella', 'Pepperoni', 'Tomato Sauce'] },
            { id: 8, name: 'Buffalo Wings', price: 10.99, description: 'Spicy chicken wings with hot sauce', image_url: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400', allergens: [], ingredients: ['Chicken Wings', 'Buffalo Sauce', 'Celery', 'Blue Cheese Dip'] }
        ];
        renderMenu();
    }
}

function renderMenu() {
    const grid = document.getElementById('menuView');
    if (!grid) return; // Exit if menu container doesn't exist

    grid.innerHTML = menuItems.map(item => `
        <div class="menu-card">
            <img src="${item.image_url || item.img}" alt="${item.name}">
            <div class="menu-card-body">
                <h3>${item.name}</h3>
                <p>${item.description || item.desc}</p>
                ${item.allergens && item.allergens.length > 0 ? `<div class="allergens">⚠️ ${item.allergens.join(', ')}</div>` : ''}
                <div class="price">$${item.price.toFixed(2)}</div>
                <button class="btn-add" onclick="openCustomizeModal(${item.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
    updateCartCount();
}

function openCustomizeModal(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Customize ${item.name}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <img src="${item.image_url || item.img}" alt="${item.name}" style="width:100%; height:200px; object-fit:cover; border-radius:12px; margin-bottom:20px;">
                <p style="color:#999; margin-bottom:20px;">${item.description || item.desc}</p>
                
                <h3 style="margin-bottom:10px;">Ingredients</h3>
                <div class="ingredients-list">
                    ${item.ingredients.map((ing, idx) => `
                        <label class="ingredient-item" style="display:flex; align-items:center; padding:10px; margin-bottom:8px; background:#2a2a3e; border-radius:8px;">
                            <input type="checkbox" checked data-ingredient="${idx}" style="margin-right:12px; width:20px; height:20px;">
                            <span style="flex:1;">${ing}</span>
                        </label>
                    `).join('')}
                </div>
                
                <h3 style="margin-top:20px; margin-bottom:10px;">Special Instructions</h3>
                <textarea id="specialNotes" placeholder="E.g., No onions, extra sauce..." style="width:100%; padding:12px; background:#2a2a3e; border:1px solid #444; border-radius:8px; color:#fff; min-height:80px; resize:vertical;"></textarea>
                
                ${item.allergens.length > 0 ? `
                    <div class="allergen-warning" style="background:#ef4444; color:white; padding:12px; border-radius:8px; margin-top:20px;">
                        <strong>⚠️ Allergens:</strong> ${item.allergens.join(', ')}
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn-primary" onclick="addCustomizedItem(${itemId})">Add to Cart - $${item.price.toFixed(2)}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function addCustomizedItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const modal = document.querySelector('.modal-overlay');
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    const notes = document.getElementById('specialNotes').value.trim();

    const removedIngredients = Array.from(checkboxes)
        .filter(cb => !cb.checked)
        .map(cb => item.ingredients[cb.dataset.ingredient]);

    // Check if identical item exists (same item, same customizations)
    const existingItem = cart.find(cartItem =>
        cartItem.id === itemId &&
        JSON.stringify(cartItem.customizations?.removed || []) === JSON.stringify(removedIngredients) &&
        (cartItem.customizations?.notes || '') === notes
    );

    if (existingItem) {
        // Merge: increment quantity
        existingItem.quantity++;
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
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart badge with animation first
    updateCartCount();

    // Show success toast
    showToast(`✓ ${item.name} added to cart!`);

    // Close modal last
    modal.remove();
}

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

function checkout() {
    if (cart.length === 0) {
        showToast('Cart is empty!', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = {
        id: Date.now(),
        items: [...cart],
        total: total,
        date: new Date().toISOString(),
        status: 'Placed'
    };

    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    showToast(`✓ Order placed successfully! Total: $${total.toFixed(2)}`);
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

renderMenu();
updateCartCount();
