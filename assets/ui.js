// -------------------------------- */
// UI MODULE                      */
// -------------------------------- */

function updateUserUI() {
    const userArea = document.getElementById('user-area');
    if (!userArea) return;

    if (checkLoginStatus()) {
        const user = getCurrentUser();
        // Display email instead of username
        const displayName = user.email ? user.email.split('@')[0] : 'User';
        userArea.innerHTML = `
            <span class="username">Welcome, ${displayName}</span>
            <button onclick="logout()" class="neon-button auth-button">Logout</button>
        `;
        if (isAdmin()) {
            userArea.innerHTML += `<a href="admin.html" class="neon-button auth-button">Admin Panel</a>`;
        }
    } else {
        userArea.innerHTML = `
            <a href="login.html" class="neon-button auth-button">Login</a>
        `;
    }
}