let isVoiceInput = false;
let isSpeaking = false;

// SVG icons
const icons = {
  micIdle: `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#333"><path d="M12 14.5q-.8 0-1.4-.6T10 12.5V6q0-.8.6-1.4T12 4q.8 0 1.4.6t.6 1.4v6.5q0 .8-.6 1.4t-1.4.6Zm-1 5.5v-2.1q-2.6-.3-4.3-2.2Q5 13.8 5 11.2h2q0 2.2 1.6 3.7 1.6 1.6 3.4 1.6t3.4-1.6Q17 13.4 17 11.2h2q0 2.6-1.7 4.5-1.7 1.9-4.3 2.2v2.1Z"/></svg>`,
  micActive: `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#e53935"><path d="M12 14.5q-.8 0-1.4-.6T10 12.5V6q0-.8.6-1.4T12 4q.8 0 1.4.6t.6 1.4v6.5q0 .8-.6 1.4t-1.4.6Zm-1 5.5v-2.1q-2.6-.3-4.3-2.2Q5 13.8 5 11.2h2q0 2.2 1.6 3.7 1.6 1.6 3.4 1.6t3.4-1.6Q17 13.4 17 11.2h2q0 2.6-1.7 4.5-1.7 1.9-4.3 2.2v2.1Z"/></svg>`,
  speaker: `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#4caf50"><path d="M3 10v4h4l5 5V5L7 10H3Zm14.5 2q0-.875-.312-1.638-.313-.762-.938-1.387l-1.4 1.425q.425.425.637.937.213.513.213 1.163t-.213 1.162q-.212.512-.637.937l1.4 1.425q.625-.625.938-1.387.312-.763.312-1.638Zm3.5 0q0-1.75-.675-3.3-.675-1.55-1.825-2.7L17.1 7.4q.8.8 1.275 1.862Q19 10.325 19 12q0 1.675-.625 3.225T17.1 17.6l1.4 1.4q1.15-1.15 1.825-2.7Q21 14.75 21 13Z"/></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#1976d2"><path d="M4 20v-5l8-3-8-3V4l16 8Z"/></svg>`
};

// Set icons
document.getElementById("micBtn").innerHTML = icons.micIdle;
document.getElementById("sendBtn").innerHTML = icons.send;

async function sendMessage() {
  const input = document.getElementById("userInput");
  const value = input.value.trim();
  if (!value) return;

  const chatbox = document.getElementById("chatbox");

  const userBubble = document.createElement("div");
  userBubble.className = "bubble user";
  userBubble.textContent = value;
  chatbox.appendChild(userBubble);

  const botBubble = document.createElement("div");
  botBubble.className = "bubble bot";
  botBubble.textContent = "Thinking...";
  chatbox.appendChild(botBubble);

  input.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const res = await fetch("/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: value })
    });
    const data = await res.json();
    const reply = data.response || "No reply";
    botBubble.textContent = "";

    let i = 0;
    const type = setInterval(() => {
      botBubble.textContent += reply[i++];
      chatbox.scrollTop = chatbox.scrollHeight;
      if (i >= reply.length) clearInterval(type);
    }, 25);

    // If input was via voice, also speak the reply
    if (isVoiceInput) {
      speak(reply);
      isVoiceInput = false;
    }
  } catch (err) {
    botBubble.textContent = "⚠️ Error contacting server.";
  }
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find(v => v.name.includes("Daniel") || v.name.includes("Google UK English Male")) || voices[0];
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  isSpeaking = true;
  document.getElementById("micBtn").innerHTML = icons.speaker;

  utterance.onend = () => {
    isSpeaking = false;
    document.getElementById("micBtn").innerHTML = icons.micIdle;
  };

  speechSynthesis.speak(utterance);
}

function startVoiceInput() {
  if (isSpeaking) return;

  const mic = document.getElementById("micBtn");
  mic.innerHTML = icons.micActive;

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log("🎤 Listening...");
    isVoiceInput = true;
  };

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    mic.innerHTML = icons.micIdle;
    await sendMessage();
  };

  recognition.onerror = (event) => {
    console.error("Voice error:", event.error);
    mic.innerHTML = icons.micIdle;
    isVoiceInput = false;
  };

  recognition.onend = () => {
    if (!isSpeaking) mic.innerHTML = icons.micIdle;
    console.log("🎤 Mic stopped");
  };

  setTimeout(() => recognition.start(), 1000); // slight delay
}
