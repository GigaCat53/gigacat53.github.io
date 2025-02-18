let map;

// Initiera Google Maps
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.505, lng: -0.09 },
        zoom: 13,
        mapTypeId: 'hybrid'
    });
}

// Hämta element
const chatInput = document.getElementById('chat-input');
const chatWindow = document.getElementById('chat-window');
const sendButton = document.getElementById('send-button');

// Lyssna på knapptryck
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Funktion för att skicka meddelande och hämta koordinater från AI
async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatWindow.innerHTML += `<div class="message user-message">${userMessage}</div>`;
    chatInput.value = '';

    // Anropa OpenAI API via Azure
    const azureUrl = "https://sivai.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview";
    const apiKey = "8I2sXTQQg7GSzi0KpoXX2Ej2AIheZGXaU7y3oyVwyFC86JUlIKzpJQQJ99BBACfhMk5XJ3w3AAABACOGZsMD"; // Byt ut mot din API-nyckel

    try {
        const response = await fetch(azureUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: `Ge mig latitud och longitud för ${userMessage} i JSON-format: { "lat": X, "lng": Y }` }],
                max_tokens: 50
            })
        });

        if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`);

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Försök tolka JSON-svaret från AI
        let location;
        try {
            location = JSON.parse(aiResponse);
        } catch (err) {
            throw new Error("AI svarade inte med giltiga koordinater.");
        }

        console.log("Extracted location:", location);

        if (location.lat && location.lng) {
            chatWindow.innerHTML += `<div class="message ai-message">Platsen är markerad på kartan!</div>`;
            addMarker(location.lat, location.lng);
        } else {
            throw new Error("Kunde inte tolka platsdata.");
        }

    } catch (error) {
        chatWindow.innerHTML += `<div class="message ai-message error">Fel: ${error.message}</div>`;
    }
}

// Funktion för att lägga till markör på kartan
function addMarker(lat, lng) {
    new google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Platsen du sökte!",
    });
    map.setCenter({ lat, lng });
    map.setZoom(14);
}
