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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinGame', (playerName) => {
    console.log(`${playerName} (${socket.id}) wants to join`);
    
    socket.emit('waitingForOpponent');
  });

  socket.on('submitAnswer', (data) => {
    console.log('Answer submitted:', data);
    
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io listening for connections`);
});
