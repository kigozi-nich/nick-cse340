// Form Validation Functions
'use strict'

// Validate password with requirements
const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(.{12,})$/;
    return regex.test(password);
}

// Validate email format
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate name (letters and spaces only)
const validateName = (name) => {
    const regex = /^[a-zA-Z\s-]+$/;
    return regex.test(name);
}

// Add form validation listeners
document.addEventListener('DOMContentLoaded', function() {
    // Registration form validation
    const registerForm = document.querySelector('#registerForm');
    if (registerForm) {
        registerForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', function() {
                let valid = true;
                let message = '';

                switch(this.id) {
                    case 'account_firstname':
                    case 'account_lastname':
                        valid = validateName(this.value);
                        message = valid ? '' : 'Please enter a valid name (letters only)';
                        break;
                    case 'account_email':
                        valid = validateEmail(this.value);
                        message = valid ? '' : 'Please enter a valid email address';
                        break;
                    case 'account_password':
                        valid = validatePassword(this.value);
                        message = valid ? '' : 'Password must be at least 12 characters and contain an uppercase letter, number, and special character';
                        break;
                }

                // Update UI feedback
                this.classList.toggle('valid', valid);
                this.classList.toggle('invalid', !valid);
                
                const feedbackDiv = this.nextElementSibling;
                if (feedbackDiv && feedbackDiv.classList.contains('message')) {
                    feedbackDiv.textContent = message;
                }
            });
        });
    }

    // Vehicle form validation
    const inventoryForm = document.querySelector('#addInventoryForm');
    if (inventoryForm) {
        inventoryForm.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', function() {
                let valid = true;
                let message = '';

                if (this.hasAttribute('required') && !this.value) {
                    valid = false;
                    message = 'This field is required';
                } else {
                    switch(this.id) {
                        case 'inv_price':
                            valid = /^\d+(\.\d{0,2})?$/.test(this.value);
                            message = valid ? '' : 'Please enter a valid price';
                            break;
                        case 'inv_miles':
                            valid = /^\d+$/.test(this.value);
                            message = valid ? '' : 'Please enter a valid mileage number';
                            break;
                        case 'inv_year':
                            valid = /^\d{4}$/.test(this.value);
                            message = valid ? '' : 'Please enter a valid 4-digit year';
                            break;
                    }
                }

                // Update UI feedback
                this.classList.toggle('valid', valid);
                this.classList.toggle('invalid', !valid);
                
                const feedbackDiv = this.nextElementSibling;
                if (feedbackDiv && feedbackDiv.classList.contains('message')) {
                    feedbackDiv.textContent = message;
                }
            });
        });
    }
});
