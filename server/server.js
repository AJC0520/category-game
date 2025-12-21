import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Category Game Server is running!' });
});

const gameRooms = new Map();

const createCode = () => {
  return Math.random().toString(36).substring(2, 7);
}

io.on("connection", (socket) => {
    socket.on("createLobby", () =>{
        const code = createCode()

        gameRooms.set(code, {
          code: code,
          players: [{ id: socket.id, name: "Host"}],
          host: socket.id
        })

        socket.join(code)
        socket.emit("lobbyCreated", code)
    })

    socket.on("joinLobby", (code) => {
      if (!gameRooms.has(code)){
        socket.emit("lobbyNotFound")
        return
      }
      
      socket.join(code)
      socket.emit("lobbyJoined", code)
    })
})

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io listening for connections`);
});
