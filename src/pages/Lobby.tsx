import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { socket } from "../services/sockets"

type Player = {
    id: string
    name: string
}

export default function Lobby() {
    const { code } = useParams<{ code: string}>()
    const navigate = useNavigate()
    const location = useLocation()
    const [players, setPlayers] = useState<Player[]>([])
    const [hostId, setHostId] = useState<string>("")
    const [player, setPlayer] = useState<Player | null>(null)
    
    const gameResults = location.state?.gameResults

    const isHost = socket.id === hostId

    const handleStartGame = () => {
        socket.emit("startGame", code)
    }

    useEffect(() => {
        socket.emit("joinLobby", code)

        socket.on("lobbyNotFound", () => {
            alert("not found")
            navigate("/")
        })

        // Listens to player updates
        socket.on("playersUpdated", (updatedPlayers) => {
            setPlayers(updatedPlayers)
        })

        socket.on("lobbyData", (lobbyData) => {
            setHostId(lobbyData.host)
        })

        socket.on("gameStarted", (gameData) => {
            console.log("game started for", player?.name)
            navigate(`/game`, { state: { gameData, players, code } })
        })

        return () => {
            socket.off("lobbyNotFound")
            socket.off("playersUpdated")
            socket.off("lobbyData")
            socket.off("gameStarted")
        }
        
    }, [code, navigate])


    useEffect(() => {
        const currentPlayer = players.find(p => p.id === socket.id)

        if(currentPlayer){
            setPlayer(currentPlayer)
        }
    }, [players])

    useEffect(() => {
        if (gameResults) {
            console.log("Game Results:", gameResults)
        }
    }, [gameResults])

    return(
        <div>
            <h1>Category game</h1>
            <h2>Lobby code: {code}</h2>
            <h3>Players:</h3>
            <ul>
                {players.map(player => (
                    <li key={player.id}>
                        {player.name} {player.id === socket.id && "(You)"}
                    </li>
                ))}
            </ul>
            
            {isHost && <button onClick={handleStartGame}>Start game</button>}

        </div>
    )
}