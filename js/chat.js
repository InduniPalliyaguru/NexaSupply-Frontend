function toggleNexaChat() {
    const chatPopup = document.getElementById("nexaChatPopup");
    if (chatPopup) {
        chatPopup.classList.toggle("active");
    }
}

function handleNexaChatKeyPress(event) {
    if (event.key === "Enter") {
        sendNexaChatMessage();
    }
}

async function sendNexaChatMessage() {
    const inputField = document.getElementById("nexaChatInput");
    const chatBody = document.getElementById("nexaChatBody");
    const typingIndicator = document.getElementById("nexaTypingIndicator");

    const prompt = inputField.value.trim();
    if (!prompt) return;

    appendNexaMessage(prompt, "nexa-user-msg");
    inputField.value = "";

    if (typingIndicator) {
        typingIndicator.style.display = "block";
        chatBody.appendChild(typingIndicator);
    }
    scrollNexaChatToBottom();

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({message: prompt})
        });

        const result = await response.json();
        console.log("Chat Response:", result);

        if (typingIndicator) {
            typingIndicator.style.display = "none";
        }

        if (response.ok || result.code === 200 || result.status === 200) {

            let aiResponse = "No response received.";

            if (result.body && result.body.reply) {
                aiResponse = result.body.reply;
            } else if (result.reply) {
                aiResponse = result.reply;
            } else if (result.data && result.data.reply) {
                aiResponse = result.data.reply;
            }

            appendNexaMessage(aiResponse, "nexa-bot-msg");

        } else {
            console.error("Failed to get chat response:", result.message);
            appendNexaMessage("Failed to get response from server.", "nexa-bot-msg");
        }

    } catch (error) {
        if (typingIndicator) {
            typingIndicator.style.display = "none";
        }
        console.error("Chat API Fetch Error:", error);
        appendNexaMessage("Error communicating with AI server. Please try again.", "nexa-bot-msg");
    }
}

function appendNexaMessage(text, className) {
    const chatBody = document.getElementById("nexaChatBody");
    const typingIndicator = document.getElementById("nexaTypingIndicator");

    const msgDiv = document.createElement("div");
    msgDiv.className = `nexa-msg ${className}`;
    msgDiv.innerText = text;

    if (typingIndicator) {
        chatBody.insertBefore(msgDiv, typingIndicator);
    } else {
        chatBody.appendChild(msgDiv);
    }

    scrollNexaChatToBottom();
}

function scrollNexaChatToBottom() {
    const chatBody = document.getElementById("nexaChatBody");
    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}