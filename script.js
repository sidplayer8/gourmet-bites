// Removed imports for file:// compatibility
// import { auth, provider } from "./firebase-config.js";
// import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Menu Data (Fetched from Vercel Postgres)
let MENU_DATA = [];

// Fetch Menu from Vercel Postgres API
async function fetchMenu() {
    try {
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('Failed to fetch menu');

        MENU_DATA = await response.json();
        console.log("✅ Menu loaded from database:", MENU_DATA.length, "items");
        renderMenu(); // Re-render menu after fetching
    } catch (error) {
        console.error("❌ Error fetching menu:", error);
        // Fallback to empty or show error
        showStatus("Failed to load menu. Please refresh.", true);
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

// State
let state = {
    user: null,
    avatar: null,
    isAdmin: false,
    cart: [],
    activeCategory: "All",
    activeTab: 'menu',
    currentCustomizingItem: null
};

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
                state.isAdmin = false;
                updateUserUI(user);
                enterApp();
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
                // Try Firebase Phone Auth first
                if (window.sendFirebaseVerificationCode) {
                    window.sendFirebaseVerificationCode(phone);
                } else {
                    // Fallback to mock SMS
                    sendVerificationCode(phone);
                }
            } else {
                alert("Please enter a valid phone number (at least 8 digits).");
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

            // Try Firebase SMS verification first
            if (window.verifyFirebaseSMSCode) {
                window.verifyFirebaseSMSCode(enteredCode);
            } else if (enteredCode === generatedCode) {
                // Fallback to mock verification
                loginWithPhone(pendingPhone);
                generatedCode = null;
                pendingPhone = null;
            } else {
                alert("Invalid verification code. Please try again.");
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

            } catch (error) {
                console.error(error);
                alert("Login Failed: " + error.message);
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
                alert("Invalid Admin Credentials");
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
}

function enterApp() {
    app.loginView.classList.remove('active');
    app.loginView.classList.add('hidden');

    app.bottomNav.classList.remove('hidden');
    if (state.activeTab === 'menu' && app.mainView.classList.contains('hidden')) {
        switchTab('menu');
    }
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
    if (state.isAdmin) {
        resetApp();
    } else if (state.user && !auth.currentUser) {
        // Phone login - no Firebase auth
        resetApp();
    } else {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Logout Error:", error);
        }
    }
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

function saveItem() {
    const id = app.itemId.value ? parseInt(app.itemId.value) : Date.now();
    const name = app.itemName.value;
    const desc = app.itemDesc.value;
    const price = parseFloat(app.itemPrice.value);
    const category = app.itemCategory.value;
    const image = app.itemImage.value || "burger.jpg";
    const allergens = app.itemAllergens.value.split(',').map(s => s.trim()).filter(s => s);

    const existingItemIndex = MENU_DATA.findIndex(i => i.id === id);

    if (existingItemIndex >= 0) {
        // Update
        MENU_DATA[existingItemIndex] = {
            ...MENU_DATA[existingItemIndex],
            name, desc, price, category, image, allergens
        };
        alert("Item updated successfully!");
    } else {
        // Add
        MENU_DATA.push({
            id, name, desc, price, category, image, allergens,
            options: [] // Default empty options
        });
        alert("Item added successfully!");
    }

    saveMenuData();
    renderMenu();
    app.itemModal.classList.add('hidden');
}

function deleteItem() {
    const id = parseInt(app.itemId.value);
    if (confirm("Are you sure you want to delete this item?")) {
        const index = MENU_DATA.findIndex(i => i.id === id);
        if (index >= 0) {
            MENU_DATA.splice(index, 1);
            saveMenuData();
            renderMenu();
            app.itemModal.classList.add('hidden');
            alert("Item deleted.");
        }
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

    // Fetch Real Orders from Supabase
    try {
        let ordersQuery = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        // Filter by user if not admin
        if (!state.isAdmin && currentUser) {
            ordersQuery = ordersQuery.eq('user_id', currentUser.uid);
        }

        const { data: orders, error } = await ordersQuery;

        if (error) throw error;

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
    app.customizeTotal.textContent = `$${item.price.toFixed(2)}`;
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
    const selectedOptions = Array.from(app.customizeOptions.querySelectorAll('input:checked')).map(cb => cb.value);

    // Calculate extra price from options (simple logic: +$1 or +$2 if string contains it)
    let extraPrice = 0;
    selectedOptions.forEach(opt => {
        if (opt.includes("+$1")) extraPrice += 1;
        if (opt.includes("+$2")) extraPrice += 2;
    });

    const cartItem = {
        ...item,
        price: item.price + extraPrice,
        qty: 1,
        instructions: instructions,
        selectedOptions: selectedOptions,
        cartId: Date.now() // Unique ID for cart item (since same item can have diff customizations)
    };

    state.cart.push(cartItem);
    updateCartUI();
    closeCustomize();

    // Feedback
    // alert("Added to cart!"); 
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

        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();

        if (error) throw error;

        console.log("✅ Order saved:", data);
        alert("Order placed successfully! Kitchen is preparing your food.");

        state.cart = [];
        updateCartUI();
        closeCart();

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
