document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = chatForm.querySelector('textarea');
    const typingIndicator = document.getElementById('typing-indicator');

    /**
     * Adds a message to the chat display and scrolls to the bottom.
     * @param {string} text - The message content.
     * @param {('user'|'gemini')} sender - The sender of the message.
     */
    const addMessage = (text, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageElement.appendChild(paragraph);

        chatMessages.appendChild(messageElement);
        // Auto-scroll to the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = userInput.value.trim();

        if (!messageText) {
            return;
        }

        // Display user's message
        addMessage(messageText, 'user');
        userInput.value = '';
        userInput.style.height = 'auto'; // Reset textarea height

        // Show typing indicator while waiting for the response
        typingIndicator.style.display = 'flex';

        try {
            // Send message to the backend API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            // Hide typing indicator
            typingIndicator.style.display = 'none';

            if (!response.ok) {
                // The backend sends errors in a JSON object with an 'error' key.
                const errorData = await response.json().catch(() => ({ error: 'Sorry, something went wrong on the server.' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Display Gemini's response
            addMessage(data.reply, 'gemini');

        } catch (error) {
            console.error('Error:', error);
            // Hide typing indicator on error
            typingIndicator.style.display = 'none';
            addMessage(error.message || 'Failed to get a response. Please try again.', 'gemini');
        }
    });

    // Auto-resize textarea to fit content
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
    });
});
