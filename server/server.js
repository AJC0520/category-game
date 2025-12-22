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

        const lobby = gameRooms.get(code)
        io.to(code).emit("playersUpdated", lobby.players)
    })

    socket.on("joinLobby", (code) => {
      if (!gameRooms.has(code)){
        socket.emit("lobbyNotFound")
        return
      }
      
      const lobby = gameRooms.get(code)
      
      const existingPlayer = lobby.players.find(p => p.id == socket.id)
      if(!existingPlayer){
        lobby.players.push({
          id: socket.id,
          name: `Player ${lobby.players.length + 1}`
        })
      }
      socket.join(code)
      socket.emit("lobbyJoined", code)

      socket.emit("lobbyData", {host: lobby.host})

      io.to(code).emit("playersUpdated", lobby.players)
    })

    socket.on("startGame", (code) => {
      const lobby = gameRooms.get(code)

      if (lobby.host !== socket.id) {
        socket.emit("error", "only host can start game")
        return
      }

      io.to(code).emit("gameStarted")
    })
})

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io listening for connections`);
});
