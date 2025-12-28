import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { categories } from './data/sampleData.js';

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
          host: socket.id,
          gameResults: []
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

      if (!lobby) {
        socket.emit("error", "Lobby not found")
        return
      }

      if (lobby.host !== socket.id) {
        socket.emit("error", "only host can start game")
        return
      }

      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      
      lobby.gameResults = []
      
      io.to(code).emit("gameStarted", {
        category: randomCategory,
        startTime: Date.now()
      })
    })

    socket.on("gameFinished", ({ code, playerId, score, foundAnswers, foundAnswersCount, totalAnswers }) => {
      const lobby = gameRooms.get(code)

      if (!lobby) {
        socket.emit("error", "Lobby not found")
        return
      }
      const existingResult = lobby.gameResults.find(r => r.playerId === playerId)
      if (!existingResult) {
        lobby.gameResults.push({
          playerId,
          playerName: lobby.players.find(p => p.id === playerId)?.name || "Unknown",
          score,
          foundAnswers,
          foundAnswersCount,
          totalAnswers
        })
      }

      if (lobby.gameResults.length === lobby.players.length) {
        const sortedResults = lobby.gameResults.sort((a, b) => b.score - a.score)
      
        io.to(code).emit("returnToLobby", sortedResults)
      }
    })
})

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io listening for connections`);
});
