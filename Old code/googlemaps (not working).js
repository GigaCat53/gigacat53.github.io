    // Initialize Google Maps
    let map;

    function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.505, lng: -0.09 },
        zoom: 13,
    });

    new google.maps.Marker({
        position: { lat: 51.505, lng: -0.09 },
        map,
        title: "London is a great place to visit!",
    });
    }

    // Chat functionality
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const sendButton = document.getElementById('send-button');

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
    });

    chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto'; // Återställ höjd
    chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px'; // Justera höjd men begränsa maxhöjd
    });

    function sendMessage() {
    const userMessage = chatInput.value;
    if (!userMessage.trim()) return;

    // Display user message
    chatWindow.innerHTML += `<div class="message user-message">${userMessage}</div>`;
    chatInput.value = '';
    chatInput.style.height = '40px'; // Återställ inputfältets höjd

    // Simulate AI response
    setTimeout(() => {
        const response = fetchAIResponse(userMessage);
        chatWindow.innerHTML += `<div class="message ai-message">${response}</div>`;
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Update map based on AI response
        let location = null;
        if (response.includes("Paris")) {
        location = { lat: 48.8566, lng: 2.3522 };
        } else if (response.includes("New York")) {
        location = { lat: 40.7128, lng: -74.0060 };
        } else if (response.includes("Tokyo")) {
        location = { lat: 35.6895, lng: 139.6917 };
        }

        if (location) {
        map.setCenter(location);
        new google.maps.Marker({ position: location, map });
        }
    }, 500);
    }

    async function askAI() {
        const userInput = document.getElementById("userInput").value;
        const responseDiv = document.getElementById("response");
        const azureUrl = "https://sivai.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview";
        const apiKey = "8I2sXTQQg7GSzi0KpoXX2Ej2AIheZGXaU7y3oyVwyFC86JUlIKzpJQQJ99BBACfhMk5XJ3w3AAABACOGZsMD";

        responseDiv.innerHTML = "<p class='text-gray-500'>Väntar på svar...</p>";

        try {
            const response = await fetch(azureUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({ prompt: userInput, max_tokens: 100 })
            });
            const data = await response.json();
            responseDiv.innerHTML = `<p>${data.choices[0].text}</p>`;
        } catch (error) {
            responseDiv.innerHTML = "<p class='text-red-500'>Något gick fel! Kontrollera din API-nyckel och URL.</p>";
        }
    }

    // Mock AI API function
    //function fetchAIResponse(message) {
    //if (message.toLowerCase().includes("paris")) {
        //return "You should visit Paris! It's known for its art, culture, and cuisine.";
    //} else if (message.toLowerCase().includes("new york")) {
        //return "New York is a must-visit! It's famous for its skyscrapers, Broadway, and diverse culture.";
    //} else if (message.toLowerCase().includes("tokyo")) {
        //return "Tokyo is an amazing destination! It offers a unique blend of tradition and modernity.";
    //} else {
        //return "I recommend visiting Paris, New York, or Tokyo. They are all incredible cities!";
    //}
    //}

    // Theme toggle functionality
    //const themeToggle = document.getElementById('theme-toggle');
    //themeToggle.addEventListener('click', () => {
    //const currentTheme = document.documentElement.getAttribute('data-theme');
    //if (currentTheme === 'dark') {
        //document.documentElement.removeAttribute('data-theme');
    //} else {
        //document.documentElement.setAttribute('data-theme', 'dark');
    //}
    //});
