// app.js - Main Website Logic (Firebase Integration)

// Shopping cart
let cart = [];

// Wait for Firebase to load
window.addEventListener('DOMContentLoaded', async () => {
    console.log("App initialized");
    
    // Load content from Firebase
    await loadContentFromFirebase();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load cart from localStorage
    loadCartFromStorage();
});

// Load all content from Firebase
async function loadContentFromFirebase() {
    try {
        console.log("Loading content from Firebase...");
        
        // 1. Load settings
        await loadSettings();
        
        // 2. Load menu items
        await loadMenuItems();
        
        // 3. Load testimonials
        await loadTestimonials();
        
        console.log("All content loaded successfully");
        
    } catch (error) {
        console.error("Error loading content:", error);
        showNotification("Error loading content. Please refresh.", "error");
    }
}

// Load settings from Firebase
async function loadSettings() {
    try {
        const settingsRef = firestore.doc(db, "settings", "config");
        const settingsSnap = await firestore.getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            
            // Update business info
            if (data.businessName) {
                document.getElementById('businessName').textContent = data.businessName;
                document.getElementById('footerBusinessName').textContent = data.businessName;
                document.getElementById('footerBrand').textContent = data.businessName;
            }
            
            if (data.heroTitle) {
                document.getElementById('heroTitle').textContent = data.heroTitle;
            }
            
            if (data.heroTagline) {
                document.getElementById('heroTagline').textContent = data.heroTagline;
            }
            
            if (data.aboutText) {
                document.getElementById('aboutText').innerHTML = 
                    `<p>${data.aboutText.replace(/\n/g, '</p><p>')}</p>`;
            }
            
            // Update contact info
            if (data.address) {
                document.getElementById('businessAddress').textContent = data.address;
            }
            
            if (data.phoneNumber) {
                document.getElementById('businessPhone').textContent = data.phoneNumber;
            }
            
            if (data.email) {
                document.getElementById('businessEmail').textContent = data.email;
            }
            
            if (data.businessHours) {
                document.getElementById('businessHours').textContent = data.businessHours;
            }
            
            // Setup WhatsApp button
            if (data.whatsappNumber) {
                const whatsappBtn = document.getElementById('whatsappLaunch48');
                whatsappBtn.href = `https://wa.me/${data.whatsappNumber}?text=Hi%20Abana%20Cafe!%20I%20saw%20your%20website%20and%20would%20like%20to%20know%20more.`;
                whatsappBtn.style.display = 'flex';
            }
            
            // Setup Paystack payment
            if (data.paymentLink) {
                document.getElementById('paystackBtn').onclick = () => {
                    if (cart.length === 0) {
                        showNotification("Your cart is empty", "error");
                        return;
                    }
                    window.open(data.paymentLink, '_blank');
                    submitOrderToFirebase(); // Save order to Firebase
                };
            }
            
        } else {
            console.log("No settings found in Firebase");
        }
        
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

// Load menu items from Firebase
async function loadMenuItems() {
    try {
        const menuItemsRef = firestore.collection(db, "menuItems");
        const querySnapshot = await firestore.getDocs(menuItemsRef);
        
        const menuItemsContainer = document.getElementById('menuItems');
        
        if (querySnapshot.empty) {
            menuItemsContainer.innerHTML = `
                <div class="menu-item">
                    <div class="menu-item-content">
                        <h3 class="menu-item-title">Menu Coming Soon</h3>
                        <p class="menu-item-desc">Check back later for our delicious offerings!</p>
                    </div>
                </div>
            `;
            return;
        }
        
        let menuHTML = '';
        querySnapshot.forEach((doc) => {
            const item = doc.data();
            menuHTML += `
                <div class="menu-item" data-category="${item.category || 'all'}">
                    <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'}" 
                         alt="${item.name}" class="menu-item-img">
                    <div class="menu-item-content">
                        <h3 class="menu-item-title">${item.name}</h3>
                        <p class="menu-item-desc">${item.description || ''}</p>
                        <span class="menu-item-price">₦${parseInt(item.price).toLocaleString()}</span>
                        <button class="btn btn-primary" onclick="addToCart('${item.name}', ${item.price})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
        });
        
        menuItemsContainer.innerHTML = menuHTML;
        
        // Setup filtering
        setupMenuFiltering();
        
    } catch (error) {
        console.error("Error loading menu items:", error);
        document.getElementById('menuItems').innerHTML = `
            <div class="menu-item">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">Error Loading Menu</h3>
                    <p class="menu-item-desc">Please try again later</p>
                </div>
            </div>
        `;
    }
}

// Load testimonials from Firebase
async function loadTestimonials() {
    try {
        const testimonialsRef = firestore.collection(db, "testimonials");
        const q = firestore.query(testimonialsRef, firestore.limit(3));
        const querySnapshot = await firestore.getDocs(q);
        
        const testimonialsGrid = document.getElementById('testimonialsGrid');
        
        if (!querySnapshot.empty) {
            let testimonialsHTML = '';
            
            querySnapshot.forEach((doc) => {
                const testimonial = doc.data();
                const stars = '★'.repeat(testimonial.rating || 5);
                
                testimonialsHTML += `
                    <div class="testimonial-card">
                        <div class="stars">
                            ${stars}
                        </div>
                        <p class="testimonial-text">"${testimonial.text}"</p>
                        <p class="testimonial-author">- ${testimonial.author}</p>
                    </div>
                `;
            });
            
            testimonialsGrid.innerHTML = testimonialsHTML;
        }
        
    } catch (error) {
        console.error("Error loading testimonials:", error);
    }
}

// Setup menu filtering
function setupMenuFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter items
            const filter = btn.dataset.filter;
            
            menuItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Contact form submit
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        sendContactMessage();
    });
    
    // Order form submit
    document.getElementById('orderForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder();
    });
}

// Shopping cart functions
function addToCart(itemName, itemPrice) {
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: parseFloat(itemPrice),
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    
    showNotification(`${itemName} added to cart!`, "success");
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = '₦0';
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₦${item.price} x ${item.quantity}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = itemsHTML;
    cartTotal.textContent = `₦${total}`;
}

function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = newQuantity;
    }
    
    updateCartDisplay();
    saveCartToStorage();
}

// LocalStorage functions
function saveCartToStorage() {
    localStorage.setItem('abanaCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('abanaCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Submit order to Firebase
async function submitOrderToFirebase() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const instructions = document.getElementById('instructions').value;
    
    if (!name || !phone || !email || !address) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const orderData = {
            name: name,
            phone: phone,
            email: email,
            address: address,
            instructions: instructions || '',
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending',
            createdAt: firestore.serverTimestamp()
        };
        
        // Save order to Firebase
        await firestore.addDoc(firestore.collection(db, "orders"), orderData);
        
        // Save customer contact to messages
        await firestore.addDoc(firestore.collection(db, "messages"), {
            name: name,
            email: email,
            phone: phone,
            message: `New order placed from ${name}. Total: ₦${orderData.total}`,
            type: 'order',
            read: false,
            createdAt: firestore.serverTimestamp()
        });
        
        // Clear cart and form
        cart = [];
        updateCartDisplay();
        saveCartToStorage();
        document.getElementById('orderForm').reset();
        
        showNotification('Order placed successfully! We will contact you shortly.', 'success');
        
    } catch (error) {
        console.error('Error saving order:', error);
        showNotification('Error placing order. Please try again.', 'error');
    }
}

// Send contact message
async function sendContactMessage() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        await firestore.addDoc(firestore.collection(db, "messages"), {
            name: name,
            email: email,
            message: message,
            type: 'contact',
            read: false,
            createdAt: firestore.serverTimestamp()
        });
        
        showNotification('Message sent successfully! We will get back to you soon.', 'success');
        document.getElementById('contactForm').reset();
        
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message. Please try again.', 'error');
    }
}

// Submit order (for Paystack button)
function submitOrder() {
    // Handled by Paystack button click
    showNotification('Please click the Paystack button to complete payment', 'info');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.getElementById('notificationContainer').appendChild(notification);
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Make functions available globally
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.submitOrder = submitOrder;
window.sendContactMessage = sendContactMessage;
window.scrollToOrder = scrollToOrder;
window.scrollToMenu = scrollToMenu;