
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
  });

const map = L.map('map').setView([62, 16], 5); // defaultview utszoomad så man ser hela sverige.

     
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
     }).addTo(map);

// Kolla om geolocation är tillgängligt (fungerar ej i Brave browser)
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
            alert('Kunde inte hämta din plats.'); //om det inte går
        }
    );
} else {
    alert('Geolocation stöds inte i din webbläsare.'); //denna fungerade inte för mig i brave
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
    const azureUrl = "https://borisaicog.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview"; // Azure OpenAI API URL
    const apiKey = "88aSk7d0qdidY1eREIvYu70vcTEKsMEfI4oAvofWo0GxpEEZeFoEJQQJ99BEACfhMk5XJ3w3AAAAACOG3KXU"; // Api nyckel för Azure OpenAI
  
    //Ger AI instruktion för att alltid nämna platsen sist så den går att zooma in och nåla fast.
    body: JSON.stringify({
    messages: [
        {
            role: "system",
            content: "När du nämner en plats, ange alltid namnet som ett ensamt ord sist i meningen. Exempel: 'En bra plats är Stockholm' eller 'Jag rekommenderar Göteborg'."
        },
        {
            role: "user",
            content: userMessage
        }
    ],
    max_tokens: 100
    })
    //ai svar
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
      
        // Visa AI:s svar i chatten
        chatWindow.innerHTML += `<div class="message ai-message">${aiResponse}</div>`;
      
        const placeMatch = extractLocationFromText(aiResponse);
        if (placeMatch) {
            locatePlaceOnMap(placeMatch);
        }
      } else {
        throw new Error("Tomt svar från AI:n"); // Om AI inte ger något svar
      }
      
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (error) {
      chatWindow.innerHTML += `<div class="message ai-message error">Fel vid API-anrop: ${error.message}</div>`;
    }
  }
  //Här nedan är mitt försök att få kartan att zooma in och nåla in platsen som presenteras av AI men jag fick aldrig till det :(
  function extractLocationFromText(text) {
    // Försök hitta platser i olika format
    const patterns = [
        /(?:i|till|är|ligger i|rekommenderar|föreslår|plats är)\s+([A-ZÅÄÖ][a-zåäöA-ZÅÄÖ\- ]+)/i,
        /(?:i\s+)([A-ZÅÄÖ][a-zåäöA-ZÅÄÖ\- ]+)(?:\s+:)/
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim().replace(/[.,:!?)]+$/, ''); // Ta bort skiljetecken i slutet
        }
    }

    // försöker matcha vad ai kan säga
    const explicitMatch = text.match(/(?:En plats är|Ett bra val är|Rekommenderar)\s+([A-ZÅÄÖ][a-zåäöA-ZÅÄÖ\- ]+)/i);
    if (explicitMatch && explicitMatch[1]) {
        return explicitMatch[1].trim().replace(/[.,:!?)]+$/, '');
    }

    return null;
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

  //försöker hitta platsen som ai presenterar
async function locatePlaceOnMap(placeName) {
    try {
        console.log(`Försöker hitta plats: ${placeName}`); // Debuggning
        
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&countrycodes=se&limit=1`);
        const data = await response.json();

        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            
            // Ta bort tidigare markörer
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) map.removeLayer(layer);
            });

            map.setView([lat, lon], 12);
            L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`📍 ${placeName}`)
                .openPopup();
            
            console.log(`Plats hittad: ${placeName} (${lat}, ${lon})`); // ifall den hittar
        } else {
            console.warn(`Platsen "${placeName}" kunde inte hittas`); //hittar inte
        }
    } catch (error) {
        console.error('Fel vid geokodning:', error);//error
    }
}

  