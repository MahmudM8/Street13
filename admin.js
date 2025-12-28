// admin.js - Admin Panel Logic

// Check if user is logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        loadAdminData();
    } else {
        // User is logged out
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }
});

// Login function
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            errorElement.textContent = '';
        })
        .catch((error) => {
            console.error('Login error:', error);
            errorElement.textContent = 'Login failed: ' + error.message;
        });
}

// Logout function
function logout() {
    auth.signOut();
}

// Show different sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId + 'Section').style.display = 'block';
    
    // Update active link
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load data for section
    if (sectionId === 'menu') loadMenuItemsForAdmin();
    if (sectionId === 'messages') loadMessagesForAdmin();
    if (sectionId === 'dashboard') loadStats();
}

// Load admin data
async function loadAdminData() {
    try {
        const settingsDoc = await db.collection('settings').doc('config').get();
        
        if (settingsDoc.exists) {
            const data = settingsDoc.data();
            
            // Populate forms
            document.getElementById('editBusinessName').value = data.businessName || '';
            document.getElementById('editHeroTitle').value = data.heroTitle || '';
            document.getElementById('editHeroTagline').value = data.heroTagline || '';
            document.getElementById('editAboutText').value = data.aboutText || '';
            document.getElementById('editPhoneNumber').value = data.phoneNumber || '';
            document.getElementById('editEmail').value = data.email || '';
            document.getElementById('editAddress').value = data.address || '';
            document.getElementById('editWhatsapp').value = data.whatsappNumber || '';
            document.getElementById('editPaymentLink').value = data.paymentLink || '';
        }
        
        await loadStats();
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('Error loading data. Please refresh.', 'error');
    }
}

// Load dashboard stats
async function loadStats() {
    try {
        const messagesSnapshot = await db.collection('messages').get();
        document.getElementById('totalMessages').textContent = messagesSnapshot.size;
        
        const menuSnapshot = await db.collection('menuItems').get();
        document.getElementById('totalMenuItems').textContent = menuSnapshot.size;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Save all settings
async function saveSettings() {
    const settings = {
        businessName: document.getElementById('editBusinessName').value,
        heroTitle: document.getElementById('editHeroTitle').value,
        heroTagline: document.getElementById('editHeroTagline').value,
        aboutText: document.getElementById('editAboutText').value,
        phoneNumber: document.getElementById('editPhoneNumber').value,
        email: document.getElementById('editEmail').value,
        address: document.getElementById('editAddress').value,
        whatsappNumber: document.getElementById('editWhatsapp').value,
        paymentLink: document.getElementById('editPaymentLink').value,
        updatedAt: new Date()
    };
    
    try {
        await db.collection('settings').doc('config').set(settings, { merge: true });
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings: ' + error.message, 'error');
    }
}

// Add menu item
async function addMenuItem() {
    const name = document.getElementById('newItemName').value;
    const description = document.getElementById('newItemDesc').value;
    const price = document.getElementById('newItemPrice').value;
    
    if (!name || !price) {
        showNotification('Please enter name and price', 'error');
        return;
    }
    
    try {
        await db.collection('menuItems').add({
            name: name,
            description: description || '',
            price: parseFloat(price),
            category: 'milk',
            createdAt: new Date()
        });
        
        // Clear form
        document.getElementById('newItemName').value = '';
        document.getElementById('newItemDesc').value = '';
        document.getElementById('newItemPrice').value = '';
        
        // Reload
        await loadMenuItemsForAdmin();
        await loadStats();
        
        showNotification('Menu item added!', 'success');
        
    } catch (error) {
        console.error('Error adding menu item:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Load menu items for admin
async function loadMenuItemsForAdmin() {
    try {
        const snapshot = await db.collection('menuItems').get();
        const container = document.getElementById('currentMenuItems');
        
        if (snapshot.empty) {
            container.innerHTML = '<p>No menu items yet.</p>';
            return;
        }
        
        let html = '<div style="display: grid; gap: 10px;">';
        snapshot.forEach(doc => {
            const item = doc.data();
            html += `
                <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${item.name}</strong> - ₦${item.price}<br>
                        <small>${item.description || ''}</small>
                    </div>
                    <button onclick="deleteMenuItem('${doc.id}')" 
                            style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                        Delete
                    </button>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading menu items:', error);
        container.innerHTML = '<p>Error loading menu items.</p>';
    }
}

// Delete menu item
async function deleteMenuItem(itemId) {
    if (confirm('Delete this menu item?')) {
        try {
            await db.collection('menuItems').doc(itemId).delete();
            await loadMenuItemsForAdmin();
            await loadStats();
            showNotification('Menu item deleted!', 'success');
        } catch (error) {
            console.error('Error deleting menu item:', error);
            showNotification('Error: ' + error.message, 'error');
        }
    }
}

// Load messages for admin
async function loadMessagesForAdmin() {
    try {
        const snapshot = await db.collection('messages')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        const container = document.getElementById('messagesList');
        
        if (snapshot.empty) {
            container.innerHTML = '<p>No messages yet.</p>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const msg = doc.data();
            const date = msg.createdAt?.toDate().toLocaleString() || 'Unknown';
            
            html += `
                <div class="message-item ${msg.read ? '' : 'unread'}">
                    <div class="message-header">
                        <strong>${msg.name || 'Anonymous'}</strong>
                        <span>${date}</span>
                    </div>
                    <p><strong>Email:</strong> ${msg.email || 'No email'}</p>
                    <p><strong>Message:</strong> ${msg.message}</p>
                    ${msg.type ? `<span style="background: #6E473B; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">${msg.type}</span>` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading messages:', error);
        container.innerHTML = '<p>Error loading messages.</p>';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing
    const existing = document.querySelector('.admin-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Make functions available globally
window.login = login;
window.logout = logout;
window.showSection = showSection;
window.saveSettings = saveSettings;
window.addMenuItem = addMenuItem;
window.deleteMenuItem = deleteMenuItem;