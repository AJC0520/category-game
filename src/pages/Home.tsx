import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../services/sockets";
import TiltedCard from "../components/TiltedCard";

import SinglePlayerIcon from "../assets/singleplayer_icon.png";
import CreateLobbyIcon from "../assets/create_lobby_icon.png";

import "./Home.css";

export default function Home() {
  const [lobbyCode, setLobbyCode] = useState("");
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://10.22.62.179:3001';
      const response = await fetch(`${API_URL}/api/random-category`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      const category = await response.json();
      navigate("/game", { state: { category } });
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleCreateLobby = () => {
    socket.emit("createLobby");
  };

  const handleJoinLobby = () => {
    socket.emit("joinLobby", lobbyCode);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server!", socket.id);
    });

    socket.on("lobbyCreated", (code) => {
      console.log("Lobby created", code);
      navigate(`/lobby/${code}`);
    });

    socket.on("lobbyJoined", (code) => {
      console.log("Lobby joined", code);
      navigate(`/lobby/${code}`);
    });

    socket.on("error", (message) => {
      alert(message);
    });

    return () => {
      socket.off("connect");
      socket.off("lobbyCreated");
      socket.off("lobbyJoined");
      socket.off("error");
    };
  }, [navigate]);
  return (
    <div>
      <h1 className="main-title">Obscurify</h1>
      <div className="gamemode-selection">
        <div onClick={handleStart}>
          <TiltedCard
            imageSrc={SinglePlayerIcon}
            altText="Singleplayer"
            captionText="Test yourself in a singleplayer game"
            containerHeight="300px"
            containerWidth="300px"
            imageHeight="300px"
            imageWidth="300px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={<p>Singleplayer</p>}
          />
        </div>
        <div onClick={handleCreateLobby}>
          <TiltedCard
            imageSrc={CreateLobbyIcon}
            altText="Create lobby"
            captionText="Create a lobby and invite friends"
            containerHeight="300px"
            containerWidth="300px"
            imageHeight="300px"
            imageWidth="300px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={<p>Create Lobby</p>}
          />
        </div>
      </div>

      <div className="input-wrapper">
        <h3> Do you have a code?</h3>
        <div className="input-container">
          <input
            type="text"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value)}
            placeholder="abcde"
            maxLength={5}
          />
          <p onClick={handleJoinLobby}>Join lobby</p>
        </div>

      </div>
    </div>
  );
}
