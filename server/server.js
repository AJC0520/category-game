import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { supabase } from './config/supabase.js';

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

// API endpoint to get random category for singleplayer
app.get('/api/random-category', async (req, res) => {
  try {
    // Fetch all categories
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoryError || !categories || categories.length === 0) {
      return res.status(500).json({ error: 'Failed to load categories' });
    }

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // Fetch answers for this category
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('text, obscurity_score')
      .eq('category_id', randomCategory.id);

    if (answersError || !answers) {
      return res.status(500).json({ error: 'Failed to load answers' });
    }

    const categoryData = {
      id: randomCategory.id,
      name: randomCategory.name,
      answers: answers.map(a => ({
        text: a.text,
        obscurityScore: a.obscurity_score
      }))
    };

    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching random category:', error);
    res.status(500).json({ error: 'Server error' });
  }
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

    socket.on("startGame", async (code) => {
      const lobby = gameRooms.get(code)

      if (!lobby) {
        socket.emit("error", "Lobby not found")
        return
      }

      if (lobby.host !== socket.id) {
        socket.emit("error", "only host can start game")
        return
      }

      // Fetch random category from Supabase
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoryError || !categories || categories.length === 0) {
        socket.emit("error", "Failed to load categories")
        console.error('Category fetch error:', categoryError)
        return
      }

      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Fetch answers for this category
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('text, obscurity_score')
        .eq('category_id', randomCategory.id);

      if (answersError || !answers) {
        socket.emit("error", "Failed to load answers")
        console.error('Answers fetch error:', answersError)
        return
      }

      const categoryData = {
        id: randomCategory.id,
        name: randomCategory.name,
        answers: answers.map(a => ({
          text: a.text,
          obscurityScore: a.obscurity_score
        }))
      };
      
      lobby.gameResults = []
      
      io.to(code).emit("gameStarted", {
        category: categoryData,
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
