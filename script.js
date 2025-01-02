// Select DOM elements
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// API setup
const API_KEY = "AIzaSyDGrAE8bxgOjyf0ydZDDqpazmF2kRfwxf4"; // Replace with your valid API key
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

// Initialize user message and file data
const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

// Store chat history
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// Create a message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Generate bot response using the API
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  // Add user message to chat history
  chatHistory.push({
    role: "user",
    parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])],
  });

  // API request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: chatHistory }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error.message || "Failed to fetch bot response.");

    // Extract and display bot's response text
    const apiResponseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove Markdown-style bold formatting
      .trim();

    messageElement.innerText = apiResponseText;

    // Add bot response to chat history
    chatHistory.push({
      role: "model",
      parts: [{ text: apiResponseText }],
    });
  } catch (error) {
    messageElement.innerText = `Error: ${error.message}`;
    messageElement.style.color = "#ff0000";
  } finally {
    // Reset user's file data, remove "thinking" indicator, and scroll to bottom
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
  e.preventDefault();

  userData.message = messageInput.value.trim();
  if (!userData.message) return;

  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  fileUploadWrapper.classList.remove("file-uploaded");

  // Create and display user message
  const messageContent = `<div class="message-text"></div>
    ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // Create bot "thinking" message
  setTimeout(() => {
    const messageContent = `<img class="bot-avatar" src="robotic.png" alt="Chatbot Logo" width="50" height="50">
      <div class="message-text">
        <div class="thinking-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>`;
    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius =
    messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && !e.shiftKey && userMessage) {
    handleOutgoingMessage(e);
  }
});

// Handle file input change
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
  };

  reader.readAsDataURL(file);
});

// Cancel file upload
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
});

// Emoji picker setup
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
});
document.querySelector(".chat-form").appendChild(picker);

// Event listeners
sendMessage.addEventListener("click", handleOutgoingMessage);
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));


const btnCart = document.querySelector('#cart-icon');
const cart = document.querySelector('.cart');
const btnClose = document.querySelector('#cart-close');
const cartContent = document.querySelector('.cart-content');
const cartCount = document.querySelector('.cart-count');
const totalPrice = document.querySelector('.total-price');  
const foodItems = document.querySelectorAll('.add-cart');

// To store items in the cart
let itemList = [];

// Center the cart content
cartContent.style.textAlign = 'center';

btnCart.addEventListener('click', () => {
  cart.classList.add('cart-active');
  cart.style.display = 'block'; // Ensure the cart is visible when activated
});

btnClose.addEventListener('click', () => {
  cart.classList.remove('cart-active');
  cart.style.display = 'none'; // Hide the cart when close is clicked
});

// Add food item to the cart
foodItems.forEach((btn) => {
  btn.addEventListener('click', addToCart);
});

function addToCart() {
  const food = this.parentElement;
  const title = food.querySelector('.food-title').textContent;
  const price = food.querySelector('.food-price').textContent;
  const imgSrc = food.querySelector('.food-img').src;

  // Check if the product already exists in the cart
  const existingItem = itemList.find(item => item.title === title);

  if (existingItem) {
    // If the product exists, just increase its quantity
    existingItem.quantity += 1;
    const cartItem = cartContent.querySelector(`.cart-box[data-title="${title}"]`);
    const quantityInput = cartItem.querySelector('.cart-quantity');
    quantityInput.value = existingItem.quantity;
  } else {
    // Otherwise, add the new product to the itemList
    itemList.push({ title, price, imgSrc, quantity: 1 });

    // Create a new cart item element
    const cartItem = createCartItem(title, price, imgSrc);
    cartContent.insertAdjacentHTML('beforeend', cartItem);
  }

  updateCart();
}

function createCartItem(title, price, imgSrc) {
  return `
    <div class="cart-box" data-title="${title}" style="margin: 0 auto;">
      <img src="${imgSrc}" class="cart-img">
      <div class="detail-box">
        <div class="cart-food-title">${title}</div>
        <div class="price-box">
          <div class="cart-price">${price}</div>
          <div class="cart-amt">${price}</div>
        </div>
        <input type="number" value="1" class="cart-quantity" min="1">
      </div>
      <ion-icon name="trash" class="cart-remove" style="font-size: 1.5rem;"></ion-icon>
    </div>
  `;
}

function updateCart() {
  const cartItems = document.querySelectorAll('.cart-box');
  let total = 0;

  cartItems.forEach((item) => {
    const price = parseFloat(item.querySelector('.cart-price').textContent.replace('Rs.', ''));
    const quantity = item.querySelector('.cart-quantity').value;
    const amount = price * quantity;
    item.querySelector('.cart-amt').textContent = `Rs.${amount.toFixed(2)}`;

    total += amount;

    // Attach remove functionality to trash icon (removes item entirely)
    item.querySelector('.cart-remove').addEventListener('click', () => {
      const title = item.querySelector('.cart-food-title').textContent;
      itemList = itemList.filter(item => item.title !== title); // Remove item from itemList
      item.remove(); // Remove item from the cart view
      updateCart(); // Update cart total and count
    });

    // Attach quantity change functionality
    item.querySelector('.cart-quantity').addEventListener('input', (e) => {
      if (isNaN(e.target.value) || e.target.value < 1) {
        e.target.value = 1;
      }

      // Update the quantity in the itemList array
      const title = item.querySelector('.cart-food-title').textContent;
      const product = itemList.find(item => item.title === title);
      product.quantity = e.target.value;

      updateCart(); // Recalculate the total when quantity changes
    });
  });

  // Update total price in the cart
  totalPrice.textContent = `Rs.${total.toFixed(2)}`;

  // Update cart count
  cartCount.textContent = itemList.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.style.display = itemList.length === 0 ? 'none' : 'block';
}



document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    const usernameError = document.getElementById('username-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    let isValid = true;

    // Clear previous error messages
    usernameError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';

    // Validate username
    if (username === '') {
        usernameError.textContent = 'Username cannot be empty';
        usernameError.style.display = 'block';
        isValid = false;
    }

    // Validate email
    if (email === '') {
        emailError.textContent = 'Email cannot be empty';
        emailError.style.display = 'block';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = 'Invalid email format';
        emailError.style.display = 'block';
        isValid = false;
    }

    // Validate phone number
    if (phone === '') {
        phoneError.textContent = 'Phone number cannot be empty';
        phoneError.style.display = 'block';
        isValid = false;
    } else if (!/^\d{10}$/.test(phone)) {
        phoneError.textContent = 'Phone number must be 10 digits';
        phoneError.style.display = 'block';
        isValid = false;
    }

    // Validate password
    if (password === '') {
        passwordError.textContent = 'Password cannot be empty';
        passwordError.style.display = 'block';
        isValid = false;
    } else if (password.length < 4) {
        passwordError.textContent = 'Password must be at least 4 characters';
        passwordError.style.display = 'block';
        isValid = false;
    }

    // Validate confirm password
    if (confirmPassword === '') {
        confirmPasswordError.textContent = 'Confirm Password cannot be empty';
        confirmPasswordError.style.display = 'block';
        isValid = false;
    } else if (confirmPassword !== password) {
        confirmPasswordError.textContent = 'Passwords do not match';
        confirmPasswordError.style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        alert('Validation successful! Welcome!');
    }
});
// clock
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timeString = `${hours}:${minutes}:${seconds}`;
  document.getElementById('time').textContent = timeString;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString('en-US', options);
  document.getElementById('date').textContent = dateString;
}

setInterval(updateClock, 1000);
updateClock(); // Initial call to set the clock immediately