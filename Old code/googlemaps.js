// Vänta på att hela sidan laddas innan vi kör Google Maps
//window.onload = function () {
  //  initMap();
  //};
  
  // Sätt standardikoner
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
  });


    // Skapa kartan och sätt defaultposition (ex. centrera Sverige)
const map = L.map('map').setView([62, 16], 5); // Stockholm som default

// Lägg till tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Kolla om geolocation är tillgängligt
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Flytta kartan till användarens plats
            map.setView([lat, lng], 13);

            // Lägg till en markör på platsen
            L.marker([lat, lng]).addTo(map)
                .bindPopup('Du är här!')
                .openPopup();
        },
        () => {
            alert('Kunde inte hämta din plats.');
        }
    );
} else {
    alert('Geolocation stöds inte i din webbläsare.');
}

  
  // Hämta element
  const chatInput = document.getElementById('chat-input');
  const chatWindow = document.getElementById('chat-window');
  const sendButton = document.getElementById('send-button');
  const attachButton = document.getElementById('attach-button');
  
  // Eventlyssnare för att skicka meddelanden
  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Dynamiskt justera höjden på textfältet
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
  });
  
  // Funktion för att skicka meddelanden
  async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
  
    // Visa användarens meddelande i chatten
    chatWindow.innerHTML += `<div class="message user-message">${userMessage}</div>`;
    chatInput.value = '';
    chatInput.style.height = '40px';
  
    // Anropa OpenAI API via Azure
    const azureUrl = "https://simon-m7ac1dfj-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview";
    const apiKey = "Dsjf0r3JoyJ0NpHv4h19nwOGaM6jpj3CsynXkHVR4Ly90AWU8W2oJQQJ99BBACHYHv6XJ3w3AAAAACOGYTOV"; // Byt ut mot din riktiga API-nyckel
  
    try {
      const response = await fetch(azureUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 100
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const aiResponse = data.choices[0].message.content;
        chatWindow.innerHTML += `<div class="message ai-message">${aiResponse}</div>`;
      } else {
        throw new Error("Tomt svar från AI:n");
      }
  
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (error) {
      chatWindow.innerHTML += `<div class="message ai-message error">Fel vid API-anrop: ${error.message}</div>`;
    }
  }
  
  // Funktion för att bifoga bilder
  attachButton.addEventListener('click', () => {
    document.getElementById('image-upload').click();
  });
  
  // Funktion för att hantera filuppladdning
  document.getElementById('image-upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      chatWindow.innerHTML += `<div class="message user-message">📎 ${file.name}</div>`;
    }
  });

  