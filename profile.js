if (!localStorage.getItem('user')) { window.location.href = 'login.html'; }
function logout() { localStorage.removeItem('user'); localStorage.removeItem('cart'); localStorage.removeItem('orders'); window.location.href = 'login.html'; }

const user = JSON.parse(localStorage.getItem('user'));
document.getElementById('userName').textContent = user.name || 'User';
document.getElementById('userEmail').textContent = user.email || '';

const orders = JSON.parse(localStorage.getItem('orders') || '[]');
const orderHistory = document.getElementById('orderHistory');

if (orders.length === 0) {
    orderHistory.innerHTML = '<p style="color:#999; text-align:center; padding:40px;">No orders yet</p>';
} else {
    orderHistory.innerHTML = orders.reverse().map(order => `
        <div class="order-card">
            <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="order-status">${order.status}</span>
            </div>
            <p class="order-date">${new Date(order.date).toLocaleString()}</p>
            <div class="order-items">
                ${order.items.map(item => `
                    <div>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</div>
                `).join('')}
            </div>
            <div class="order-total">Total: $${order.total.toFixed(2)}</div>
        </div>
    `).join('');
}
