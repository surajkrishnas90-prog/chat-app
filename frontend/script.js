let socket;
let username = "";

const BACKEND_URL = "https://chat-backend-5e41.onrender.com";

function join() {
  username = document.getElementById("username").value;

  if (!username) return;

  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "block";

  socket = io(BACKEND_URL);

  loadMessages();

  socket.on("receive_message", (data) => {
    addMessage(data);
  });
}

async function loadMessages() {
  const res = await fetch(BACKEND_URL + "/messages");
  const data = await res.json();

  data.forEach(addMessage);
}

function send() {
  const input = document.getElementById("msg");
  const text = input.value;

  if (!text) return;

  const msg = {
    username,
    text,
    time: new Date().toLocaleTimeString()
  };

  socket.emit("send_message", msg);

  input.value = "";
}

function addMessage(data) {
  const div = document.createElement("div");

  div.innerHTML = `
    <b>${data.username}</b>:
    ${data.text}
    <small>(${data.time})</small>
  `;

  document.getElementById("messages").appendChild(div);
}