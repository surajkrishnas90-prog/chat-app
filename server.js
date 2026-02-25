require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

/* CORS */
app.use(cors());
app.use(express.json());

/* Socket.IO */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* MongoDB */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* Schema */
const messageSchema = new mongoose.Schema({
  username: String,
  text: String,
  time: String
});

const Message = mongoose.model("Message", messageSchema);

/* Routes */
app.get("/", (req, res) => {
  res.send("Chat server running");
});

app.get("/messages", async (req, res) => {
  const msgs = await Message.find().sort({ _id: 1 });
  res.json(msgs);
});

/* Socket Events */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", async (data) => {
    const msg = new Message(data);
    await msg.save();

    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* Start Server */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on", PORT);
});