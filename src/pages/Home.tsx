import { Link, useNavigate } from "react-router-dom";
import { categories } from "../data/sampledata";
import { useEffect, useState } from "react";
import { socket } from "../services/sockets";

export default function Home() {
  const [lobbyCode, setLobbyCode] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    return randomCategory;
  };

  const handleCreateLobby = () => {
    socket.emit("createLobby");
  };

  const handleJoinLobby = () => {
    return
  };


  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server!", socket.id);
    });

    socket.on("lobbyCreated", (code) => {
      console.log("Lobby created", code);
      navigate(`/lobby/${code}`);
    });

    socket.on("error", (message) => {
      alert(message);
    });

    return () => {
      socket.off("connect");
      socket.off("lobbyCreated");
      socket.off("error");
    };
  }, [navigate]);
  return (
    <div>
      <h1>Category game</h1>
      <Link to="/game" state={{ category: handleStart() }}>
        <button>Single player</button>
      </Link>
      <button onClick={handleCreateLobby}>Create Lobby</button>
      <div>
        <p>Lobby code: </p>
        <input
          type="text"
          value={lobbyCode}
          onChange={(e) => setLobbyCode(e.target.value)}
          placeholder="Enter code"
          maxLength={5}
        />
      </div>
      <button onClick={handleJoinLobby}> Join Lobby </button>

    </div>
  );
}
