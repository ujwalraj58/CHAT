function sendMessage() {
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

  fetch("/chat/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: value })
  })
    .then(res => res.json())
    .then(data => {
      botBubble.textContent = "";
      let i = 0;
      const reply = data.response || "No reply";
      const type = setInterval(() => {
        botBubble.textContent += reply[i++];
        chatbox.scrollTop = chatbox.scrollHeight;
        if (i >= reply.length) clearInterval(type);
      }, 25);
    })
    .catch(() => {
      botBubble.textContent = "⚠️ Error contacting server.";
    });
}
