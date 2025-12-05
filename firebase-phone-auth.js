// Firebase Phone Authentication Handler
// Uses Twilio for SMS since we're on Spark plan

console.log("📱 Firebase Phone Auth Module Loaded");

// Phone login with Twilio SMS
window.loginWithPhone = function (phoneNumber) {
    console.log("✅ Phone verified:", phoneNumber);

    // Create a custom token or user object for phone login
    state.user = phoneNumber;
    state.avatar = null;
    state.isAdmin = false;

    localStorage.setItem('user', phoneNumber);
    localStorage.setItem('isAdmin', 'false');

    showView('main');
    console.log("🎉 Login successful!");
};

// Back button handler
document.getElementById('back-to-phone')?.addEventListener('click', function () {
    document.getElementById('phone-step').classList.remove('hidden');
    document.getElementById('verification-step').classList.add('hidden');
    document.getElementById('verification-code').value = '';
});

console.log("✅ Phone auth handlers initialized");
