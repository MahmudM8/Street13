// script.js - Frontend Logic

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Load content from Firebase
    loadContentFromFirebase();
    
    // Setup contact form
    setupContactForm();
});

// Load all content from Firebase
async function loadContentFromFirebase() {
    try {
        console.log('Loading content from Firebase...');
        
        // Load settings
        const settingsDoc = await db.collection('settings').doc('config').get();
        
        if (settingsDoc.exists) {
            const data = settingsDoc.data();
            console.log('Settings loaded:', data);
            
            // Update website content
            updateWebsiteContent(data);
        } else {
            console.log('No settings found, using defaults');
        }
        
        // Load menu items
        await loadMenuItems();
        
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Update website with content from Firebase
function updateWebsiteContent(data) {
    // Business name
    if (data.businessName) {
        document.getElementById('businessName').textContent = data.businessName;
        document.getElementById('footerBusinessName').textContent = data.businessName;
    }
    
    // Hero section
    if (data.heroTitle) {
        document.getElementById('heroTitle').textContent = data.heroTitle;
    }
    
    if (data.heroTagline) {
        document.getElementById('heroTagline').textContent = data.heroTagline;
    }
    
    // About section
    if (data.aboutText) {
        document.getElementById('aboutContent').innerHTML = 
            `<p>${data.aboutText.replace(/\n/g, '</p><p>')}</p>`;
    }
    
    // Contact info
    if (data.phoneNumber) {
        document.getElementById('phoneNumber').textContent = data.phoneNumber;
    }
    
    if (data.address) {
        document.getElementById('businessAddress').textContent = data.address;
    }
    
    if (data.email) {
        document.getElementById('businessEmail').textContent = data.email;
    }
    
    // WhatsApp button
    if (data.whatsappNumber) {
        const whatsappBtn = document.getElementById('whatsappBtn');
        whatsappBtn.href = `https://wa.me/${data.whatsappNumber}?text=Hi%20Abana%20Cafe!%20I%20saw%20your%20website%20and%20would%20like%20to%20know%20more.`;
        whatsappBtn.style.display = 'flex';
    }
    
    // Payment link (for future use)
    if (data.paymentLink) {
        console.log('Payment link available:', data.paymentLink);
    }
}

// Load menu items from Firebase
async function loadMenuItems() {
    try {
        const menuItemsContainer = document.getElementById('menuItems');
        const snapshot = await db.collection('menuItems').get();
        
        if (snapshot.empty) {
            menuItemsContainer.innerHTML = '<p>No menu items available yet.</p>';
            return;
        }
        
        let menuHTML = '';
        snapshot.forEach(doc => {
            const item = doc.data();
            menuHTML += `
                <div class="menu-card">
                    <h3>${item.name}</h3>
                    <p>${item.description || ''}</p>
                    <p class="price">₦${parseInt(item.price).toLocaleString()}</p>
                    <button class="btn" onclick="addToCart('${item.name}', ${item.price})">
                        Add to Order
                    </button>
                </div>
            `;
        });
        
        menuItemsContainer.innerHTML = menuHTML;
        
    } catch (error) {
        console.error('Error loading menu items:', error);
        document.getElementById('menuItems').innerHTML = 
            '<p>Error loading menu. Please try again later.</p>';
    }
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            try {
                // Save message to Firebase
                await db.collection('messages').add({
                    name: name,
                    email: email,
                    message: message,
                    read: false,
                    createdAt: new Date()
                });
                
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
                
            } catch (error) {
                console.error('Error saving message:', error);
                alert('Sorry, there was an error sending your message. Please try again.');
            }
        });
    }
}

// Shopping cart functionality (basic)
let cart = [];

function addToCart(itemName, itemPrice) {
    cart.push({
        name: itemName,
        price: itemPrice
    });
    
    // Show confirmation
    alert(`${itemName} added to cart!`);
    console.log('Cart:', cart);
}

// Scroll to menu
function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ 
        behavior: 'smooth' 
    });
}