const cartFunctions = {
    cart: [],

    loadCart: function() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
        this.updateCartDisplay();
    },

    saveCart: function() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    },

    addToCart: function(name, price) {
        const existingItem = this.cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ name, price, quantity: 1 });
        }
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification(`${name} added to cart!`);
    },

    removeFromCart: function(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
    },

    updateCartDisplay: function() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.getElementById('cart-count');
        const cartCountMobile = document.getElementById('cart-count-mobile');

        if (cartItems) {
            cartItems.innerHTML = '';
            let total = 0;
            this.cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div>
                        <h4>${item.name}</h4>
                        <p>₹${item.price} x ${item.quantity} = ₹${itemTotal}</p>
                    </div>
                    <button class="remove-item" onclick="cartFunctions.removeFromCart(${index})">&times;</button>
                `;
                cartItems.appendChild(itemElement);
            });

            if (cartTotal) {
                cartTotal.innerHTML = `<h3>Total: ₹${total}</h3>`;
            }
        }

        const totalQuantity = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalQuantity;
        if (cartCountMobile) cartCountMobile.textContent = totalQuantity;
    },

    showNotification: function(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div style="background: #4CAF50; color: white; padding: 1rem; border-radius: 5px; margin-bottom: 1rem;">
                ${message}
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
};

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Auto-play carousel
setInterval(nextSlide, 5000);

// Mobile menu toggle
function toggleMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('active');
}

// Form submission
document.addEventListener('DOMContentLoaded', async function() {
    // Load cart on page load
    await cartFunctions.loadCart();

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const orderData = {
                fullName: formData.get('fullName') || this.querySelector('[placeholder="Full Name"]').value,
                email: formData.get('email') || this.querySelector('[placeholder="Email"]').value,
                phone: formData.get('phone') || this.querySelector('[placeholder="Phone Number"]').value,
                address: formData.get('address') || this.querySelector('[placeholder="Delivery Address"]').value,
                deliveryDateTime: formData.get('deliveryDateTime') || this.querySelector('[placeholder="Delivery Date & Time"]').value,
                specialInstructions: formData.get('specialInstructions') || this.querySelector('[placeholder="Special Instructions (Optional)"]').value,
                cart: cartFunctions.cart
            };

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                });

                if (response.ok) {
                    const result = await response.json();

                    // Also send to Google Sheets using the form's data
                    const sheetsFormData = new FormData(this);
                    sheetsFormData.append('cart', JSON.stringify(orderData.cart));
                    sheetsFormData.append('total', orderData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));

                    try {
                        const sheetsResponse = await fetch('https://script.google.com/macros/s/AKfycbzPCR3jJP9uMCkyyzDk1TSpRN8YffDeFi_ByfwxUChIkoOGGTm6vLj0rpIgcnV6-YQ/exec', {
                            method: 'POST',
                            body: sheetsFormData
                        });

                        if (!sheetsResponse.ok) {
                            console.error('Google Sheets submission failed:', sheetsResponse.status);
                        }
                    } catch (sheetsError) {
                        console.error('Error submitting to Google Sheets:', sheetsError);
                    }

                    alert(`Order placed successfully! Order ID: ${result.orderId}`);
                    cartFunctions.cart = []; // Clear the cart
                    cartFunctions.saveCart();
                    cartFunctions.updateCartDisplay();
                    this.reset();
                } else {
                    const error = await response.json();
                    alert(`Error placing order: ${error.error}`);
                }
            } catch (error) {
                console.error('Error placing order:', error);
                alert('Error placing order. Please try again.');
            }
        });
    }

    // Contact form submission is handled by Google Sheets script in contact.html
});

// Modal functionality
const modal = document.getElementById('cart-modal');
const closeBtn = document.querySelector('.close');

if (closeBtn) {
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('nav-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const flowerCards = document.querySelectorAll('.flower-card');
            flowerCards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                if (name.includes(query) || description.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});
