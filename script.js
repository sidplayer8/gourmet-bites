// Removed imports for file:// compatibility
// import { auth, provider } from "./firebase-config.js";
// import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Menu Data (Fetched from Vercel Postgres)
let MENU_DATA = [];

// Fetch Menu from Vercel Postgres API
async function fetchMenu() {
    try {
        const response = await fetch('https://gourmet-bites.vercel.app/api/menu');
        if (!response.ok) throw new Error('Failed to fetch menu');

        MENU_DATA = await response.json();
        console.log("✅ Menu loaded from database:", MENU_DATA.length, "items");
        renderMenu(); // Re-render menu after fetching
    } catch (error) {
        console.error("❌ Error fetching menu:", error);
    }
}

// Load from LocalStorage (Backup)
const storedMenu = localStorage.getItem('menu_data');
if (storedMenu) {
    try {
        MENU_DATA = JSON.parse(storedMenu);
    } catch (e) {
        console.error("Failed to load menu data", e);
    }
}

const CATEGORIES = ["All", "Burgers", "Pizza", "Japanese", "Indian", "Mexican", "Chinese", "Italian", "Thai", "Western", "Mediterranean", "Starters", "Salads", "Desserts", "Drinks"];

// State - Initialize from localStorage to support admin login
let state = {
    user: localStorage.getItem('user') || null,
    avatar: null,
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    cart: [],
    activeCategory: "All",
    activeTab: 'menu',
    currentCustomizingItem: null
};

// Load cart from localStorage on page load
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            state.cart = JSON.parse(savedCart);
            console.log('✅ Cart loaded from localStorage:', state.cart.length, 'items');
        }
    } catch (error) {
        console.error('❌ Error loading cart:', error);
        state.cart = [];
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(state.cart));
    } catch (error) {
        console.error('❌ Error saving cart:', error);
    }
}

// Admin Credentials (Default)
const DEFAULT_ADMIN = {
    user: "sidplayer8",
    pass: "adithidumb"
};

// DOM Elements Container
let app = {};

// Initialization
async function init() {
    console.log("App Initializing...");

    // Initialize DOM elements
    app = {
        loginView: document.getElementById('login-view'),
        mainView: document.getElementById('main-view'),
        profileView: document.getElementById('profile-view'),
        loginForm: document.getElementById('login-form'),
        googleLoginBtn: document.getElementById('google-login-btn'),
        adminLoginLink: document.getElementById('admin-login-btn'),
        phoneInput: document.getElementById('phone'),
        userPhoneDisplay: document.getElementById('user-phone'),
        userAvatar: document.getElementById('user-avatar'),
        defaultAvatar: document.getElementById('default-avatar'),
        logoutBtn: document.getElementById('logout-btn'),
        logoutBtnProfile: document.getElementById('logout-btn-profile'),
        menuGrid: document.getElementById('menu-grid'),
        categoryScroll: document.querySelector('.category-scroll'),
        cartFab: document.getElementById('cart-fab'),
        viewCartBtn: document.getElementById('view-cart-btn'),
        cartModal: document.getElementById('cart-modal'),
        closeCartBtn: document.getElementById('close-cart'),
        cartItemsContainer: document.getElementById('cart-items'),
        modalTotal: document.getElementById('modal-total'),
        checkoutBtn: document.getElementById('checkout-btn'),
        itemCount: document.querySelector('.item-count'),
        cartTotal: document.querySelector('.cart-total'),
        bottomNav: document.getElementById('bottom-nav'),
        navCartCount: document.getElementById('nav-cart-count'),
        profileName: document.getElementById('profile-name'),
        profilePhone: document.getElementById('profile-phone'),
        profileImgLarge: document.getElementById('profile-img-large'),
        profileInitial: document.getElementById('profile-initial'),
        orderHistory: document.getElementById('order-history'),
        // Customization Modal
        customizeModal: document.getElementById('customize-modal'),
        closeCustomizeBtn: document.getElementById('close-customize'),
        customizeTitle: document.getElementById('customize-title'),
        customizeAllergens: document.getElementById('customize-allergens'),
        allergenText: document.getElementById('allergen-text'),
        specialInstructions: document.getElementById('special-instructions'),
        customizeOptions: document.getElementById('customize-options'),
        customizeTotal: document.getElementById('customize-total'),
        addCustomBtn: document.getElementById('add-custom-btn'),
        // Admin Modals
        adminLoginModal: document.getElementById('admin-login-modal'),
        closeAdminLoginBtn: document.getElementById('close-admin-login'),
        adminLoginForm: document.getElementById('admin-login-form'),
        adminUserInput: document.getElementById('admin-user'),
        adminPassInput: document.getElementById('admin-pass'),
        // Item Modal (Add/Edit)
        itemModal: document.getElementById('item-modal'),
        closeItemModalBtn: document.getElementById('close-item-modal'),
        itemForm: document.getElementById('item-form'),
        itemId: document.getElementById('item-id'),
        itemName: document.getElementById('item-name'),
        itemCategory: document.getElementById('item-category'),
        itemImage: document.getElementById('item-image'),
        itemDesc: document.getElementById('item-desc'),
        itemAllergens: document.getElementById('item-allergens'),
        itemPrice: document.getElementById('item-price'),
        deleteItemBtn: document.getElementById('delete-item-btn'),
        itemModalTitle: document.getElementById('item-modal-title')
    };

    console.log("DOM Elements initialized:", app);

    setupEventListeners();
    renderCategories();

    // Load cart from localStorage
    loadCart();
    updateCartUI(); // Update UI with loaded cart

    // Fetch menu from Supabase
    await fetchMenu();

    // Check for stored admin credentials
    if (!localStorage.getItem('admin_creds')) {
        localStorage.setItem('admin_creds', JSON.stringify(DEFAULT_ADMIN));
    }

    // Check Auth State
    if (window.firebase) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log("User is signed in:", user.phoneNumber || user.email);
                currentUser = user;
                state.user = user.displayName || user.phoneNumber || user.email;
                state.avatar = user.photoURL;

                // Check if user is admin from localStorage BEFORE overwriting
                const storedIsAdmin = localStorage.getItem('isAdmin');
                state.isAdmin = storedIsAdmin === 'true';

                updateUserUI(user);
                enterApp();

                // Navigate to user route if not already on a route AND not admin AND not on admin route
                const currentHash = window.location.hash;
                const isOnAdminRoute = currentHash.includes('/admin');
                if (!state.isAdmin && !isOnAdminRoute && (!currentHash || currentHash === '#/' || currentHash === '#/login')) {
                    const encryptedId = encryptUserId(state.user);
                    Router.navigate('/user/' + encryptedId);
                }
            } else {
                console.log("User is signed out");
                currentUser = null;
                if (!state.isAdmin) resetApp();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', init);

function setupEventListeners() {
    console.log("Setting up event listeners...");

    // Send Code Button Listener
    const sendCodeBtn = document.getElementById('send-code-btn');
    if (sendCodeBtn) {
        console.log("✅ Send Code Button found");
        sendCodeBtn.addEventListener('click', (e) => {
            console.log("🖱️ Send Code Clicked");
            e.preventDefault();
            const phone = app.phoneInput.value.trim();
            if (phone.length >= 8) {
                // Use Twilio SMS Auth
                if (window.sendTwilioVerificationCode) {
                    window.sendTwilioVerificationCode(phone);
                } else {
                    showToast("SMS service not available. Please try again.");
                }
            } else {
                showToast("Please enter a valid phone number (at least 8 digits).");
            }
        });
    } else {
        console.error("❌ Send Code Button NOT found");
    }

    // Verify Code Button Listener
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    if (verifyCodeBtn) {
        console.log("✅ Verify Code Button found");
        verifyCodeBtn.addEventListener('click', (e) => {
            console.log("🖱️ Verify Code Clicked");
            e.preventDefault();
            const enteredCode = document.getElementById('verification-code').value.trim();

            // Use Twilio SMS verification
            if (window.verifyTwilioSMSCode) {
                window.verifyTwilioSMSCode(enteredCode);
            } else {
                showToast("SMS verification not available. Please try again.");
            }
        });
    }

    // Helper function to show phone step
    function showPhoneStep() {
        document.getElementById('verification-step').classList.add('hidden');
        document.getElementById('phone-step').classList.remove('hidden');
        document.getElementById('verification-code').value = '';
    }

    // Back to Phone Button
    const backToPhoneBtn = document.getElementById('back-to-phone');
    if (backToPhoneBtn) {
        backToPhoneBtn.addEventListener('click', () => {
            showPhoneStep();
            generatedCode = null;
            pendingPhone = null;
        });
    }

    // Google Login
    if (app.googleLoginBtn) {
        app.googleLoginBtn.addEventListener('click', async () => {
            console.log("🖱️ Google Login Clicked");
            try {
                const btn = app.googleLoginBtn;
                const originalContent = btn.innerHTML;
                btn.innerHTML = `<span class="material-icons-round" style="animation: spin 1s linear infinite">refresh</span> Signing in...`;
                btn.disabled = true;

                await auth.signInWithPopup(provider);

                // Save user to database
                const user = auth.currentUser;
                if (user) {
                    try {
                        await fetch('/api/auth/save-user', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                googleId: user.uid,
                                googleEmail: user.email,
                                displayName: user.displayName || user.email,
                                avatarUrl: user.photoURL
                            })
                        });
                        console.log('✅ User saved to database');
                    } catch (dbError) {
                        console.error('❌ Failed to save user to DB:', dbError);
                        // Don't block login if DB save fails
                    }
                }

            } catch (error) {
                console.error(error);
                showToast("Login Failed: " + error.message);
                app.googleLoginBtn.disabled = false;
                app.googleLoginBtn.innerHTML = originalContent;
            }
        });
    }

    // Admin Login Links
    const adminLoginLinkMain = document.getElementById('admin-login-link-main');
    const adminLoginLink = document.getElementById('admin-login-link');

    if (adminLoginLinkMain) {
        adminLoginLinkMain.addEventListener('click', (e) => {
            e.preventDefault();
            if (app.adminLoginModal) app.adminLoginModal.classList.remove('hidden');
        });
    }

    if (adminLoginLink) {
        adminLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (app.adminLoginModal) app.adminLoginModal.classList.remove('hidden');
        });
    }

    if (app.closeAdminLoginBtn) {
        app.closeAdminLoginBtn.addEventListener('click', () => {
            if (app.adminLoginModal) app.adminLoginModal.classList.add('hidden');
        });
    }

    if (app.adminLoginForm) {
        app.adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = app.adminUserInput.value;
            const pass = app.adminPassInput.value;

            const storedCreds = JSON.parse(localStorage.getItem('admin_creds'));

            if (storedCreds && user === storedCreds.user && pass === storedCreds.pass) {
                loginAdmin(user);
            } else {
                showToast("Invalid Admin Credentials");
            }
        });
    }

    // Item Management
    if (app.closeItemModalBtn) {
        app.closeItemModalBtn.addEventListener('click', () => {
            app.itemModal.classList.add('hidden');
        });
    }

    if (app.itemForm) {
        app.itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveItem();
        });
    }

    if (app.deleteItemBtn) {
        app.deleteItemBtn.addEventListener('click', deleteItem);
    }

    // Logout
    if (app.logoutBtn) app.logoutBtn.addEventListener('click', handleLogout);
    if (app.logoutBtnProfile) app.logoutBtnProfile.addEventListener('click', handleLogout);

    // Cart Interactions
    if (app.viewCartBtn) app.viewCartBtn.addEventListener('click', () => switchTab('cart'));
    if (app.closeCartBtn) app.closeCartBtn.addEventListener('click', closeCart);
    if (app.checkoutBtn) app.checkoutBtn.addEventListener('click', checkout);

    // Customization Interactions
    if (app.closeCustomizeBtn) app.closeCustomizeBtn.addEventListener('click', closeCustomize);
    if (app.addCustomBtn) app.addCustomBtn.addEventListener('click', addToCartWithCustomization);
    if (app.customizeModal) {
        app.customizeModal.addEventListener('click', (e) => {
            if (e.target === app.customizeModal) closeCustomize();
        });
    }

    // Close modal on outside click
    if (app.cartModal) {
        app.cartModal.addEventListener('click', (e) => {
            if (e.target === app.cartModal) closeCart();
        });
    }
}


// Auth State Listener
try {
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                state.user = user.displayName;
                state.avatar = user.photoURL;
                state.isAdmin = false; // Regular user login
                updateUserUI(user);
                enterApp();
            } else if (!state.isAdmin) {
                // Only reset if not logged in as admin
                resetApp();
            }
        });
    }
} catch (e) {
    console.warn("Firebase Auth not available or failed:", e);
}

function loginAdmin(username) {
    state.user = username;
    state.avatar = null;
    state.isAdmin = true;

    if (app.adminLoginModal) app.adminLoginModal.classList.add('hidden');
    app.adminUserInput.value = '';
    app.adminPassInput.value = '';

    updateUserUI({ displayName: "Administrator", photoURL: null });
    enterApp();
    renderMenu(); // Re-render to show edit buttons

    // Navigate to admin route
    Router.navigate('/admin');
}

function loginWithPhone(phoneNumber) {
    state.user = phoneNumber;
    state.avatar = null;
    state.isAdmin = false;

    // Clear phone input
    app.phoneInput.value = '';

    // Format phone number for display
    const displayName = phoneNumber;
    updateUserUI({ displayName: displayName, photoURL: null });
    enterApp();

    // Navigate to user route with encrypted ID
    const encryptedId = encryptUserId(phoneNumber);
    Router.navigate('/user/' + encryptedId);
}

function enterApp() {
    app.loginView.classList.remove('active');
    app.loginView.classList.add('hidden');

    app.bottomNav.classList.remove('hidden');

    // Force render of the active tab (default to menu if not set)
    if (!state.activeTab) state.activeTab = 'menu';
    switchTab(state.activeTab);
}

function resetApp() {
    state.user = null;
    state.avatar = null;
    state.isAdmin = false;
    state.cart = [];
    updateCartUI();

    app.mainView.classList.remove('active');
    app.mainView.classList.add('hidden');
    app.profileView.classList.remove('active');
    app.profileView.classList.add('hidden');
    app.bottomNav.classList.add('hidden');

    app.loginView.classList.remove('hidden');
    setTimeout(() => app.loginView.classList.add('active'), 50);

    app.googleLoginBtn.disabled = false;
    app.googleLoginBtn.innerHTML = `
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo">
        <span>Sign in with Google</span>
    `;

    // Reset phone/verification steps
    const phoneStep = document.getElementById('phone-step');
    const verificationStep = document.getElementById('verification-step');
    const phoneInput = document.getElementById('phone');

    if (phoneStep) phoneStep.classList.remove('hidden');
    if (verificationStep) verificationStep.classList.add('hidden');
    if (phoneInput) phoneInput.value = '';

    // Navigate to login route
    if (typeof Router !== 'undefined' && window.location.hash !== '#/login') {
        Router.navigate('/login');
    }
}

// Helper function to show views
function showView(viewName) {
    console.log('🔄 Showing view:', viewName);

    // Hide all views
    app.loginView.classList.remove('active');
    app.loginView.classList.add('hidden');
    app.mainView.classList.remove('active');
    app.mainView.classList.add('hidden');
    app.profileView.classList.remove('active');
    app.profileView.classList.add('hidden');

    // Show requested view
    if (viewName === 'login') {
        app.loginView.classList.remove('hidden');
        setTimeout(() => app.loginView.classList.add('active'), 50);
        app.bottomNav.classList.add('hidden');
    } else if (viewName === 'main') {
        app.mainView.classList.remove('hidden');
        setTimeout(() => app.mainView.classList.add('active'), 50);
        app.bottomNav.classList.remove('hidden');
        // Default to menu tab
        if (!state.activeTab) state.activeTab = 'menu';
        switchTab(state.activeTab);
    } else if (viewName === 'profile') {
        app.profileView.classList.remove('hidden');
        setTimeout(() => app.profileView.classList.add('active'), 50);
        app.bottomNav.classList.remove('hidden');
    }
}

function updateUserUI(user) {
    app.userPhoneDisplay.textContent = user.displayName || user.email;
    if (state.isAdmin) {
        app.userPhoneDisplay.innerHTML = `${user.displayName} <span class="admin-badge">ADMIN</span>`;
    }

    if (user.photoURL) {
        app.userAvatar.querySelector('img').src = user.photoURL;
        app.userAvatar.classList.remove('hidden');
        app.defaultAvatar.classList.add('hidden');
    } else {
        app.userAvatar.classList.add('hidden');
        app.defaultAvatar.classList.remove('hidden');
    }
}

async function handleLogout() {
    // Clear all state
    state.isAdmin = false;
    state.cart = [];

    // Clear cart from localStorage
    localStorage.removeItem('cart');

    if (auth.currentUser) {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Logout Error:", error);
        }
    }

    resetApp();
    // Force reload menu to remove admin buttons
    await fetchMenu();
}

// Navigation
window.switchTab = (tab) => {
    state.activeTab = tab;

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const navIndex = tab === 'menu' ? 0 : tab === 'cart' ? 1 : 2;
    if (document.querySelectorAll('.nav-item')[navIndex]) {
        document.querySelectorAll('.nav-item')[navIndex].classList.add('active');
    }

    if (tab === 'cart') {
        openCart();
        return;
    }

    app.mainView.classList.add('hidden');
    app.profileView.classList.add('hidden');
    app.mainView.classList.remove('active');
    app.profileView.classList.remove('active');

    if (tab === 'menu') {
        app.mainView.classList.remove('hidden');
        setTimeout(() => app.mainView.classList.add('active'), 10);
    } else if (tab === 'profile') {
        renderProfile();
        app.profileView.classList.remove('hidden');
        setTimeout(() => app.profileView.classList.add('active'), 10);
    }
};

// Menu Logic
function renderCategories() {
    app.categoryScroll.innerHTML = CATEGORIES.map(cat => `
        <button class="category-chip ${cat === state.activeCategory ? 'active' : ''}" 
                onclick="setCategory('${cat}')">
            ${cat}
        </button>
    `).join('');
}

window.setCategory = (cat) => {
    state.activeCategory = cat;
    renderCategories();
    renderMenu();
};

function renderMenu() {
    const filteredItems = state.activeCategory === "All"
        ? MENU_DATA
        : MENU_DATA.filter(item => item.category === state.activeCategory);

    app.menuGrid.innerHTML = filteredItems.map(item => {
        const allergenTags = item.allergens ? item.allergens.map(a => `<span class="allergen-tag">${a}</span>`).join('') : '';
        const editBtn = state.isAdmin ? `
            <button class="edit-btn" onclick="openEditItem(${item.id})">
                <span class="material-icons-round">edit</span>
            </button>
        ` : '';

        return `
        <div class="menu-item" style="position:relative;">
            ${editBtn}
            <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='burger.jpg'">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.description}</div>
                <div class="item-allergens">${allergenTags}</div>
                <div class="item-footer">
                    <div class="item-price">$${parseFloat(item.price).toFixed(2)}</div>
                    <button class="add-btn" onclick="openCustomize(${item.id})">
                        <span class="material-icons-round">add</span>
                    </button>
                </div>
            </div>
        </div>
    `}).join('');

    // Add "Add Item" button if admin
    if (state.isAdmin) {
        app.menuGrid.innerHTML = `
            <div class="menu-item add-item-card" onclick="openAddItem()">
                <div class="add-item-content">
                    <span class="material-icons-round" style="font-size:48px; color:var(--primary);">add_circle</span>
                    <p>Add New Item</p>
                </div>
            </div>
        ` + app.menuGrid.innerHTML;
    }
}

// Admin Edit Logic
// Admin Item Logic
window.openAddItem = () => {
    app.itemModalTitle.textContent = "Add New Item";
    app.itemForm.reset();
    app.itemId.value = "";
    app.deleteItemBtn.classList.add('hidden');

    // Populate categories
    app.itemCategory.innerHTML = CATEGORIES.filter(c => c !== "All").map(cat => `
        <option value="${cat}">${cat}</option>
    `).join('');

    app.itemModal.classList.remove('hidden');
};

window.openEditItem = (id) => {
    const item = MENU_DATA.find(i => i.id === id);
    if (!item) return;

    app.itemModalTitle.textContent = "Edit Item";
    app.itemId.value = item.id;
    app.itemName.value = item.name;
    app.itemDesc.value = item.desc;
    app.itemPrice.value = item.price;
    app.itemImage.value = item.image || "";
    app.itemAllergens.value = item.allergens ? item.allergens.join(", ") : "";

    // Populate categories
    app.itemCategory.innerHTML = CATEGORIES.filter(c => c !== "All").map(cat => `
        <option value="${cat}" ${cat === item.category ? 'selected' : ''}>${cat}</option>
    `).join('');

    app.deleteItemBtn.classList.remove('hidden');
    app.itemModal.classList.remove('hidden');
};

async function saveItem() {
    const id = app.itemId.value ? parseInt(app.itemId.value) : null;
    const name = app.itemName.value;
    const description = app.itemDesc.value;
    const price = parseFloat(app.itemPrice.value);
    const category = app.itemCategory.value;
    const image = app.itemImage.value || "burger.jpg";
    const allergens = app.itemAllergens.value.split(',').map(s => s.trim()).filter(s => s);

    try {
        const method = id ? 'PUT' : 'POST';
        const response = await fetch('/api/menu/manage', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, description, price, category, image, allergens })
        });

        if (!response.ok) throw new Error('Save failed');

        alert(id ? "Item updated successfully!" : "Item added successfully!");
        await fetchMenu(); // Reload from database
        app.itemModal.classList.add('hidden');
    } catch (error) {
        console.error("Error saving item:", error);
        alert("Failed to save item: " + error.message);
    }
}

async function deleteItem() {
    const id = parseInt(app.itemId.value);

    if (!confirm("Are you sure you want to delete this item?")) {
        return;
    }

    try {
        const response = await fetch('/api/menu/manage', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (!response.ok) throw new Error('Delete failed');

        alert("Item deleted successfully!");
        await fetchMenu(); // Reload from database
        app.itemModal.classList.add('hidden');
    } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item: " + error.message);
    }
}

function saveMenuData() {
    localStorage.setItem('menu_data', JSON.stringify(MENU_DATA));
}

// Profile Logic
async function renderProfile() {
    const user = state.isAdmin ? { displayName: "Administrator", email: "Admin Access" } : auth.currentUser;

    app.profileName.textContent = user ? (user.displayName || "User") : "Guest";
    app.profilePhone.textContent = user ? (user.email || "Signed in with Google") : "Not logged in";

    if (user && user.photoURL) {
        app.profileImgLarge.src = user.photoURL;
        app.profileImgLarge.classList.remove('hidden');
        app.profileInitial.classList.add('hidden');
    } else {
        app.profileImgLarge.classList.add('hidden');
        app.profileInitial.classList.remove('hidden');
    }

    // Admin Settings Section
    let adminSettingsHtml = '';
    if (state.isAdmin) {
        adminSettingsHtml = `
            <div class="profile-card admin-settings">
                <div class="section-title">Admin Settings</div>
                <form id="admin-update-form" onsubmit="updateAdminCreds(event)">
                    <div class="input-group">
                        <span class="material-icons-round">person</span>
                        <input type="text" id="new-admin-user" placeholder="New Username" required>
                    </div>
                    <div class="input-group">
                        <span class="material-icons-round">lock</span>
                        <input type="password" id="new-admin-pass" placeholder="New Password" required>
                    </div>
                    <button type="submit" class="btn-primary full-width">Update Credentials</button>
                </form>
            </div>
        `;
    }

    // Clear previous orders to prevent flash
    app.orderHistory.innerHTML = adminSettingsHtml + '<div style="text-align:center; padding:40px;"><span class="material-icons-round spin">refresh</span> Loading orders...</div>';

    // Fetch Real Orders from API
    try {
        const userId = currentUser?.uid || (state.isAdmin ? 'admin' : state.user);
        const isAdmin = state.isAdmin ? 'true' : 'false';
        const url = `/api/orders?user_id=${userId}&is_admin=${isAdmin}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch orders');

        const orders = await response.json();

        if (!orders || orders.length === 0) {
            app.orderHistory.innerHTML = adminSettingsHtml + '<p style="color:var(--text-muted); text-align:center; padding:40px;">No orders yet</p>';
            return;
        }

        // Format and display orders
        app.orderHistory.innerHTML = adminSettingsHtml + orders.map(order => {
            const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            // Format items from JSONB
            const itemsList = order.items.map(item =>
                `${item.name} x${item.qty}`
            ).join(', ');

            return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#ORD-${order.id}</span>
                    <span class="order-date">${orderDate}</span>
                </div>
                <div class="order-items">${itemsList}</div>
                <div class="order-footer" style="display:flex; justify-content:space-between; align-items:center">
                    <span class="order-status">${order.status}</span>
                    <span class="order-total">$${parseFloat(order.total).toFixed(2)}</span>
                </div>
            </div>
        `}).join('');

    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        app.orderHistory.innerHTML = adminSettingsHtml + '<p style="color:var(--error); text-align:center; padding:40px;">Failed to load orders</p>';
    }
}

window.updateAdminCreds = (e) => {
    e.preventDefault();
    const newUser = document.getElementById('new-admin-user').value;
    const newPass = document.getElementById('new-admin-pass').value;

    if (newUser && newPass) {
        localStorage.setItem('admin_creds', JSON.stringify({ user: newUser, pass: newPass }));
        alert("Admin credentials updated! Please login again.");
        handleLogout();
    }
};

// Customization Logic
window.openCustomize = (id) => {
    const item = MENU_DATA.find(i => i.id === id);
    state.currentCustomizingItem = item;

    app.customizeTitle.textContent = item.name;
    app.customizeTotal.textContent = `$${parseFloat(item.price).toFixed(2)}`;
    app.specialInstructions.value = '';

    // Allergens
    if (item.allergens && item.allergens.length > 0) {
        app.allergenText.textContent = "Contains: " + item.allergens.join(", ");
        app.customizeAllergens.classList.remove('hidden');
    } else {
        app.customizeAllergens.classList.add('hidden');
    }

    // Options
    if (item.options && item.options.length > 0) {
        app.customizeOptions.innerHTML = item.options.map(opt => `
            <label class="option-item">
                <input type="checkbox" value="${opt}">
                <span>${opt}</span>
            </label>
        `).join('');
    } else {
        app.customizeOptions.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">No specific options available.</p>';
    }

    app.customizeModal.classList.remove('hidden');
};

function closeCustomize() {
    app.customizeModal.classList.add('hidden');
    state.currentCustomizingItem = null;
}

function addToCartWithCustomization() {
    if (!state.currentCustomizingItem) return;

    const item = state.currentCustomizingItem;
    const instructions = app.specialInstructions.value.trim();
    const selectedOptions = Array.from(app.customizeOptions.querySelectorAll('input:checked')).map(cb => cb.value).sort();

    // Calculate extra price from options
    let extraPrice = 0;
    selectedOptions.forEach(opt => {
        if (opt.includes("+$1")) extraPrice += 1;
        if (opt.includes("+$2")) extraPrice += 2;
    });

    // Check if identical item exists in cart
    const existingItem = state.cart.find(cartItem =>
        cartItem.id === item.id &&
        cartItem.instructions === instructions &&
        JSON.stringify(cartItem.selectedOptions.sort()) === JSON.stringify(selectedOptions)
    );

    if (existingItem) {
        existingItem.qty += 1;
        // Update price if needed (though it should be same)
    } else {
        const cartItem = {
            ...item,
            price: parseFloat(item.price) + extraPrice, // Ensure float
            qty: 1,
            instructions: instructions,
            selectedOptions: selectedOptions,
            cartId: Date.now()
        };
        state.cart.push(cartItem);
    }

    saveCart(); // Persist cart to localStorage
    updateCartUI();
    closeCustomize();

    // Show feedback toast instead of alert
    showToast("Item added to cart!");
}

// Helper for toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Cart Logic
window.updateQty = (cartId, change) => {
    const item = state.cart.find(i => i.cartId === cartId);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            state.cart = state.cart.filter(i => i.cartId !== cartId);
        }
        updateCartUI();
        renderCartItems();
    }
};

function updateCartUI() {
    const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    app.itemCount.textContent = `${totalQty} Items`;
    app.cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
    app.modalTotal.textContent = `$${totalPrice.toFixed(2)}`;

    if (totalQty > 0) {
        app.navCartCount.textContent = totalQty;
        app.navCartCount.classList.remove('hidden');
        app.cartFab.classList.remove('hidden');

        // Auto-hide cart FAB after 3 seconds
        clearTimeout(window.cartFabTimer);
        window.cartFabTimer = setTimeout(() => {
            app.cartFab.classList.add('hidden');
        }, 3000);
    } else {
        app.navCartCount.classList.add('hidden');
        app.cartFab.classList.add('hidden');
        closeCart();
    }
}

function openCart() {
    renderCartItems();
    app.cartModal.classList.remove('hidden');
}

function closeCart() {
    app.cartModal.classList.add('hidden');
}

function renderCartItems() {
    app.cartItemsContainer.innerHTML = state.cart.map(item => {
        const optionsHtml = item.selectedOptions.length > 0
            ? `<div style="font-size:12px; color:var(--text-muted)">${item.selectedOptions.join(", ")}</div>`
            : '';
        const notesHtml = item.instructions
            ? `<div style="font-size:12px; color:var(--primary); font-style:italic">Note: ${item.instructions}</div>`
            : '';

        return `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                ${optionsHtml}
                ${notesHtml}
                <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
            </div>
            <div class="cart-controls">
                <button class="qty-btn" onclick="updateQty(${item.cartId}, -1)">
                    <span class="material-icons-round">remove</span>
                </button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" onclick="updateQty(${item.cartId}, 1)">
                    <span class="material-icons-round">add</span>
                </button>
            </div>
        </div>
    `}).join('');
}

async function checkout() {
    if (state.cart.length === 0) return;

    if (!currentUser) {
        alert("Please login to place an order.");
        app.loginView.classList.remove('hidden');
        setTimeout(() => app.loginView.classList.add('active'), 10);
        return;
    }

    if (!confirm(`Confirm order for ${app.modalTotal.textContent}?`)) return;

    const orderData = {
        user_id: currentUser.uid,
        user_phone: currentUser.phoneNumber || "Guest",
        items: state.cart,
        total: state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        status: 'pending'
    };

    try {
        const btn = app.checkoutBtn;
        const originalText = btn.textContent;
        btn.textContent = "Processing...";
        btn.disabled = true;

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Order failed');
        const data = await response.json();

        console.log("✅ Order saved:", data);

        // Show Success Modal
        state.cart = [];
        updateCartUI();
        closeCart();

        const successModal = document.getElementById('order-success-modal');
        if (successModal) {
            successModal.classList.remove('hidden');
            // Auto close after 5 seconds if not clicked
            setTimeout(() => {
                if (!successModal.classList.contains('hidden')) closeOrderSuccess();
            }, 5000);
        } else {
            alert("Order placed successfully! Kitchen is preparing your food.");
        }

    } catch (error) {
        console.error("❌ Error placing order:", error);
        alert("Failed to place order. Please try again.");
    } finally {
        if (app.checkoutBtn) {
            app.checkoutBtn.textContent = "Place Order";
            app.checkoutBtn.disabled = false;
        }
    }
}

window.closeOrderSuccess = () => {
    const modal = document.getElementById('order-success-modal');
    if (modal) modal.classList.add('hidden');
};

// ============================================
// URL ROUTER SYSTEM
// ============================================

// ID Encryption for URLs (Base64 + XOR)
const ENCRYPTION_KEY = 'gourmet-bites-2024';

function encryptUserId(id) {
    const str = String(id);
    let encrypted = '';
    for (let i = 0; i < str.length; i++) {
        encrypted += String.fromCharCode(str.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return btoa(encrypted).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
}

function decryptUserId(encrypted) {
    try {
        // Restore base64 padding and special chars
        let base64 = encrypted.replace(/_/g, '/').replace(/-/g, '+');
        while (base64.length % 4) base64 += '=';

        const decoded = atob(base64);
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
        }
        return decrypted;
    } catch (e) {
        console.error('Decryption failed:', e);
        return null;
    }
}

// Router
const Router = {
    init() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        // Handle initial route after a small delay to ensure DOM is ready
        setTimeout(() => this.handleRoute(), 100);
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const parts = hash.split('/').filter(Boolean);
        const [path, param] = parts;

        console.log('📍 Route:', hash, '| User:', state.user, '| Admin:', state.isAdmin);

        switch (path) {
            case 'login':
                this.handleLoginRoute();
                break;
            case 'admin':
            case 'admin-login':  // Additional secure admin URL
                this.handleAdminRoute();
                break;
            case 'user':
                this.handleUserRoute(param);
                break;
            case 'menu':
                this.handleMenuRoute();
                break;
            default:
                this.handleDefaultRoute();
        }
    },

    handleLoginRoute() {
        console.log('🔑 Login route requested');
        if (state.user) {
            // Already logged in - redirect to appropriate route
            if (state.isAdmin) {
                this.navigate('/admin');
            } else {
                const encryptedId = encryptUserId(state.user);
                this.navigate('/user/' + encryptedId);
            }
        } else {
            // Show login page
            showView('login');
        }
    },

    handleAdminRoute() {
        console.log('🔐 Admin route requested');
        if (!state.user) {
            // Not logged in - redirect to login and auto-open admin modal
            this.navigate('/login');
            setTimeout(() => {
                const adminLink = document.getElementById('admin-login-link-main');
                if (adminLink) adminLink.click();
            }, 300);
        } else if (state.isAdmin) {
            // Authorized - show admin view
            showView('main');
        } else {
            // Logged in as customer, not authorized for admin
            console.warn('⚠️ Unauthorized admin access attempt');
            alert('Admin access denied. You are logged in as a customer.');
            const encryptedId = encryptUserId(state.user);
            this.navigate('/user/' + encryptedId);
        }
    },

    handleUserRoute(encryptedId) {
        console.log('👤 User route requested:', encryptedId);
        if (!state.user) {
            // Not logged in - redirect to login
            this.navigate('/login');
        } else {
            // Logged in - show main view
            showView('main');
            // Optional: verify the encrypted ID matches current user
            if (encryptedId) {
                const decryptedId = decryptUserId(encryptedId);
                console.log('Decrypted user ID:', decryptedId);
            }
        }
    },

    handleMenuRoute() {
        console.log('🍔 Menu route requested');
        if (!state.user) {
            this.navigate('/');
        } else {
            showView('main');
            switchTab('menu');
        }
    },

    handleDefaultRoute() {
        console.log('🏠 Default route');
        if (state.user) {
            // User is logged in, go to menu
            if (state.isAdmin) {
                this.navigate('/admin');
            } else {
                const encryptedId = encryptUserId(state.user);
                this.navigate('/user/' + encryptedId);
            }
        } else {
            // Not logged in, stay on login page
            showView('login');
        }
    },

    navigate(path) {
        window.location.hash = path;
    }
};

// Initialize router when DOM is ready
Router.init();

