// ================================
// MAIN JAVASCRIPT FILE
// This is the brain of our
// frontend! 🧠
// ================================

// Our backend server address
const API_URL = 'http://localhost:5000/api';

// ================================
// TOAST NOTIFICATION FUNCTION
// Shows a small popup message!
// ================================
function showToast(message, type = 'success') {
    // Remove old toast if exists
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => toast.remove(), 3000);
}

// ================================
// CHECK IF USER IS LOGGED IN
// ================================
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// ================================
// GET LOGGED IN USER INFO
// ================================
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// ================================
// LOGOUT FUNCTION
// ================================
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('👋 Logged out successfully!');
    setTimeout(() => window.location.href = 'login.html', 1000);
}

// ================================
// UPDATE NAVBAR BASED ON LOGIN
// ================================
function updateNavbar() {
    const user = getUser();
    const loginLink = document.querySelector('.btn-nav');

    if (user && loginLink) {
        loginLink.textContent = `👤 ${user.name.split(' ')[0]}`;
        loginLink.href = '#';
        loginLink.onclick = logout;
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', updateNavbar);