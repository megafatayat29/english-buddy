// =============================================================================
// CHATBOT FRONTEND - VANILLA JAVASCRIPT
// =============================================================================

// State management
const conversationHistory = [];
let isWaitingForResponse = false;

// DOM elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// =============================================================================
// Event Listeners
// =============================================================================

chatForm.addEventListener('submit', handleFormSubmit);

// =============================================================================
// Main Handler: Form Submission
// =============================================================================

/**
 * Handle form submission - manages the complete chat flow
 * @param {Event} event - Form submission event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  // Get and validate user input
  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return; // Silently ignore empty messages
  }

  // Prevent multiple concurrent requests
  if (isWaitingForResponse) {
    return;
  }

  // Add user message to conversation history
  conversationHistory.push({
    role: 'user',
    text: userMessage,
  });

  // Display user message in chat box
  displayMessage('user', userMessage);

  // Clear input field
  userInput.value = '';
  userInput.focus();

  // Display "Thinking..." message and get its ID for later update
  const thinkingMessageId = displayMessage('model', 'Gemini is thinking....');

  // Set waiting flag to prevent concurrent requests
  isWaitingForResponse = true;

  try {
    // Send request to backend API
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation: conversationHistory,
      }),
    });

    // Check if HTTP response is ok
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();

    // Validate that result exists in response
    if (!data.result) {
      throw new Error('Invalid response format: missing result property');
    }

    // Add model response to conversation history
    conversationHistory.push({
      role: 'model',
      text: data.result,
    });

    // Replace "Thinking..." message with actual AI response
    updateMessage(thinkingMessageId, data.result);

  } catch (error) {
    // Log error for debugging
    console.error('Chat error:', error);

    // Determine appropriate error message
    let errorMessage = 'Failed to get response from server.';

    if (error instanceof TypeError) {
      // Network error
      errorMessage = 'Failed to connect to server. Please check your connection.';
    } else if (error.message.includes('Server error')) {
      // HTTP error
      errorMessage = 'Sorry, the server encountered an error. Please try again.';
    }

    // Replace "Thinking..." message with error message
    updateMessage(thinkingMessageId, errorMessage);

  } finally {
    // Always reset waiting flag
    isWaitingForResponse = false;
  }
}

// =============================================================================
// Utility Functions: DOM Manipulation
// =============================================================================

/**
 * Display a new message in the chat box
 * @param {string} role - Message sender ('user' or 'model')
 * @param {string} text - Message text content
 * @returns {string} - Unique ID of the message element for later updates
 */
function displayMessage(role, text) {
  // Generate unique ID for this message
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const isUser = role === 'user';

  // Create message row / wrapper
  const messageElement = document.createElement('div');
  messageElement.id = messageId;

  messageElement.className = isUser
    ? 'message user flex justify-end w-full animate-pop-in'
    : 'message model flex justify-start w-full animate-pop-in';

  // Optional avatar for model
  if (!isUser) {
    const avatar = document.createElement('div');
    avatar.className = 'w-8 h-8 rounded-full bg-pastel-blue flex items-center justify-center shadow-sm mr-2 shrink-0 mt-1';
    avatar.innerHTML = '<i class="fas fa-robot text-white text-xs"></i>';
    messageElement.appendChild(avatar);
  }

  // Create message bubble
  const messageContent = document.createElement('div');
  messageContent.className = isUser
    ? 'message-content max-w-[80%] bg-gradient-to-r from-indigo-400 to-purple-400 text-white px-5 py-3 rounded-2xl rounded-br-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap'
    : 'message-content markdown-body max-w-[80%] bg-pastel-blue/20 text-gray-700 px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-pastel-blue/30 text-sm leading-relaxed';

  // For model messages, parse markdown; for user, use plain text
  if (role === 'model') {
    messageContent.innerHTML = sanitizeHTML(marked.parse(text));
  } else {
    messageContent.textContent = text;
  }

  messageElement.appendChild(messageContent);
  chatBox.appendChild(messageElement);

  chatBox.scrollTop = chatBox.scrollHeight;

  return messageId;
}

/**
 * Basic HTML sanitization to prevent XSS while allowing markdown-generated HTML
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
function sanitizeHTML(html) {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove dangerous elements and attributes
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'style'];
  dangerousTags.forEach(tag => {
    temp.querySelectorAll(tag).forEach(el => el.remove());
  });

  // Remove event handlers from all elements
  temp.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return temp.innerHTML;
}

/**
 * Update an existing message in the chat box
 * @param {string} messageId - Unique ID of the message to update
 * @param {string} newText - New text content for the message
 */
function updateMessage(messageId, newText) {
  const messageElement = document.getElementById(messageId);

  if (messageElement) {
    const messageContent = messageElement.querySelector('.message-content');

    if (messageContent) {
      const role = messageElement.className.includes('model') ? 'model' : 'user';

      if (role === 'model') {
        messageContent.innerHTML = sanitizeHTML(marked.parse(newText));
      } else {
        messageContent.textContent = newText;
      }
    }

    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
