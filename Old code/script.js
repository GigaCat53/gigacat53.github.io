// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13); // Default view (London)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Add a default marker (London)
const defaultMarker = L.marker([51.505, -0.09]).addTo(map)
  .bindPopup('London is a great place to visit!');

// Chat functionality
const chatInput = document.getElementById('chat-input');
const chatWindow = document.getElementById('chat-window');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const userMessage = chatInput.value;
  if (!userMessage.trim()) return;

  // Display user message
  chatWindow.innerHTML += `<div class="message user-message">${userMessage}</div>`;
  chatInput.value = '';

  // Simulate AI response
  setTimeout(() => {
    const response = fetchAIResponse(userMessage);
    chatWindow.innerHTML += `<div class="message ai-message">${response}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Update map based on AI response
    if (response.includes("Paris")) {
      map.setView([48.8566, 2.3522], 13); // Zoom to Paris
      L.marker([48.8566, 2.3522]).addTo(map)
        .bindPopup('Paris is a beautiful city!');
    } else if (response.includes("New York")) {
      map.setView([40.7128, -74.0060], 13); // Zoom to New York
      L.marker([40.7128, -74.0060]).addTo(map)
        .bindPopup('New York is the city that never sleeps!');
    } else if (response.includes("Tokyo")) {
      map.setView([35.6895, 139.6917], 13); // Zoom to Tokyo
      L.marker([35.6895, 139.6917]).addTo(map)
        .bindPopup('Tokyo is a vibrant city with a mix of tradition and modernity!');
    }
  }, 500);
}

// Mock AI API function
function fetchAIResponse(message) {
  if (message.toLowerCase().includes("paris")) {
    return "You should visit Paris! It's known for its art, culture, and cuisine.";
  } else if (message.toLowerCase().includes("new york")) {
    return "New York is a must-visit! It's famous for its skyscrapers, Broadway, and diverse culture.";
  } else if (message.toLowerCase().includes("tokyo")) {
    return "Tokyo is an amazing destination! It offers a unique blend of tradition and modernity.";
  } else {
    return "I recommend visiting Paris, New York, or Tokyo. They are all incredible cities!";
  }
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }
});