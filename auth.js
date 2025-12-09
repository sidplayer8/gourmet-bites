// Authentication check
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        alert('Please login first');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
