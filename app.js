// Check auth
if (!localStorage.getItem('user')) { window.location.href = 'login.html'; }
function logout() { localStorage.removeItem('user'); localStorage.removeItem('cart'); localStorage.removeItem('orders'); window.location.href = 'login.html'; }

const menuItems = [
    {id: 1, name: 'Classic Burger', price: 11.99, desc: 'Juicy beef patty with lettuce, tomato', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'},
    {id: 2, name: 'Margherita Pizza', price: 12.99, desc: 'Fresh mozzarella, basil, tomato', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'},
    {id: 3, name: 'Chicken Tikka', price: 14.99, desc: 'Creamy Indian curry with chicken', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400'},
    {id: 4, name: 'Pasta Carbonara', price: 12.99, desc: 'Creamy pasta with bacon', img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400'},
    {id: 5, name: 'Caesar Salad', price: 8.99, desc: 'Romaine with parmesan', img: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'},
    {id: 6, name: 'Greek Salad', price: 9.99, desc: 'Vegetables with feta', img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'},
    {id: 7, name: 'Pepperoni Pizza', price: 14.99, desc: 'Pepperoni and cheese', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'},
    {id: 8, name: 'Buffalo Wings', price: 10.99, desc: 'Spicy chicken wings', img: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400'}
];

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function renderMenu() {
    const grid = document.getElementById('menuView');
    grid.innerHTML = menuItems.map(item => `
        <div class="menu-card">
            <img src="${item.img}" alt="${item.name}">
            <div class="menu-card-body">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <div class="price">$${item.price.toFixed(2)}</div>
                <button class="btn-add" onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existing = cart.find(c => c.id === itemId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({...item, quantity: 1});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`Added ${item.name} to cart!`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function updateQuantity(itemId, delta) {
    const item = cart.find(c => c.id === itemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
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
    cartDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="btn-remove" onclick="removeFromCart(${item.id})"></button>
        </div>
    `).join('');
    document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
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
        alert('Cart is empty!');
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
    
    alert(`Order placed successfully!\nTotal: $${total.toFixed(2)}\n\nCheck your profile for order history.`);
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

renderMenu();
updateCartCount();
