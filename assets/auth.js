// -------------------------------- */
// AUTHENTICATION MODULE          */
// -------------------------------- */

function initializeAuth() {
    if (!localStorage.getItem('users')) {
        const adminUser = { username: 'admin', password: 'admin123' };
        localStorage.setItem('users', JSON.stringify([adminUser]));
    }
    if (!localStorage.getItem('isLoggedIn')) {
        localStorage.setItem('isLoggedIn', 'false');
    }
}

// List of admin emails
const ADMIN_EMAILS = [
    'rishiuttamsahu@gmail.com',
    'sangitauttamkumarsahu@gmail.com',
    'admin123@gmail.com'
];
// Email/Password Signup
function signupWithEmail(email, password, confirmPassword) {
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Check if we're using Firebase (if available)
    if (typeof window.firebaseAuth !== 'undefined') {
        // Use Firebase authentication
        const auth = window.firebaseAuth;
        import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js").then(({ createUserWithEmailAndPassword }) => {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed up successfully
                    const user = userCredential.user;
                    alert("Signup successful!");
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert("Error: " + errorMessage);
                });
        });
    } else {
        // Fallback to localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.email === email);

        if (userExists) {
            alert("Email already exists.");
            return;
        }

        const newUser = { email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert("Signup successful! Please log in.");
        window.location.href = 'login.html';
    }
}

// Email/Password Login
function loginWithEmail(email, password) {
    // Check if we're using Firebase (if available)
    if (typeof window.firebaseAuth !== 'undefined') {
        // Use Firebase authentication
        const auth = window.firebaseAuth;
        import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js").then(({ signInWithEmailAndPassword }) => {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in successfully
                    const user = userCredential.user;
                    localStorage.setItem('isLoggedIn', 'true');
                    // Check if user is admin
                    const isAdmin = ADMIN_EMAILS.includes(email);
                    localStorage.setItem('currentUser', JSON.stringify({ email: user.email, isAdmin: isAdmin }));
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert("Error: " + errorMessage);
                });
        });
    } else {
        // Fallback to localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            localStorage.setItem('isLoggedIn', 'true');
            // Check if user is admin
            const isAdmin = ADMIN_EMAILS.includes(email);
            localStorage.setItem('currentUser', JSON.stringify({ email: user.email, isAdmin: isAdmin }));
            window.location.href = 'index.html';
        } else {
            alert("Invalid email or password.");
        }
    }
}

// Google Signup
function signupWithGoogle() {
    if (typeof window.firebaseAuth !== 'undefined' && typeof window.googleProvider !== 'undefined') {
        const auth = window.firebaseAuth;
        const provider = window.googleProvider;
        import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js").then(({ signInWithPopup }) => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    // Signed up/in successfully
                    const user = result.user;
                    localStorage.setItem('isLoggedIn', 'true');
                    // Check if user is admin
                    const isAdmin = ADMIN_EMAILS.includes(user.email);
                    localStorage.setItem('currentUser', JSON.stringify({ email: user.email, isAdmin: isAdmin }));
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert("Error: " + errorMessage);
                });
        });
    } else {
        alert("Google authentication is not available.");
    }
}

// Google Login (same as signup since Firebase handles it)
function loginWithGoogle() {
    signupWithGoogle();
}

// Original functions for backward compatibility
function signup(username, password, confirmPassword) {
    // Convert to email signup for compatibility
    signupWithEmail(username + "@local.com", password, confirmPassword);
}

function login(username, password) {
    // Convert to email login for compatibility
    loginWithEmail(username + "@local.com", password);
}

function logout() {
    // Check if we're using Firebase
    if (typeof window.firebaseAuth !== 'undefined') {
        import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js").then(({ signOut }) => {
            signOut(window.firebaseAuth).then(() => {
                // Sign-out successful
                localStorage.setItem('isLoggedIn', 'false');
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }).catch((error) => {
                // An error happened
                console.error("Logout error:", error);
            });
        });
    } else {
        // Fallback to localStorage
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

function checkLoginStatus() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function isAdmin() {
    const user = getCurrentUser();
    // Check if user is admin either by email or by legacy admin flag
    return user && (user.isAdmin || user.email === 'admin@local.com' || ADMIN_EMAILS.includes(user.email));
}

function enforceLogin() {
    // Allows access to login and signup pages
    const currentPage = window.location.pathname.split('/').pop();
    if (!checkLoginStatus() && currentPage !== 'login.html' && currentPage !== 'signup.html') {
        window.location.href = 'login.html';
    }
}

function enforceAdmin() {
    if (!isAdmin()) {
        alert("Access denied. Admin only.");
        window.location.href = 'index.html';
    }
}