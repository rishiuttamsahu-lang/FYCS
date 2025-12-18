// Script to add admin user to localStorage
(function() {
    // Check if localStorage is available
    if (typeof(Storage) !== "undefined") {
        // Get existing users or initialize empty array
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if admin123@gmail.com already exists
        const userExists = users.some(user => user.email === 'admin123@gmail.com');
        
        if (!userExists) {
            // Add the new admin user
            const newUser = {
                email: 'admin123@gmail.com',
                password: 'admin123' // In a real app, this should be hashed
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('Admin user admin123@gmail.com added successfully!');
        } else {
            console.log('Admin user admin123@gmail.com already exists.');
        }
        
        // Also ensure isLoggedIn is set to false initially
        if (!localStorage.getItem('isLoggedIn')) {
            localStorage.setItem('isLoggedIn', 'false');
        }
        
        // Show all users for verification
        console.log('Current users:', JSON.parse(localStorage.getItem('users')) || []);
    } else {
        console.log('Sorry, your browser does not support Web Storage.');
    }
})();