// Vänta på att hela sidan laddas innan vi kör Google Maps
window.onload = function () {
    initMap();
  };
  
  // Initialize Google Maps
  let map;
  
  function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 51.505, lng: -0.09 },
      zoom: 13,
      mapTypeId: 'hybrid'
    });
  
    new google.maps.Marker({
      position: { lat: 51.505, lng: -0.09 },
      map,
      title: "London is a great place to visit!",
    });
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
    const azureUrl = "https://sivai.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview";
    const apiKey = "8I2sXTQQg7GSzi0KpoXX2Ej2AIheZGXaU7y3oyVwyFC86JUlIKzpJQQJ99BBACfhMk5XJ3w3AAABACOGZsMD"; // Byt ut mot din riktiga API-nyckel
  
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
  
  // Lägga till mörkt/ljust tema
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');
  });
  