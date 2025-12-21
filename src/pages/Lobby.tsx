import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { socket } from "../services/sockets"

type Player = {
    id: string
    name: string
}

export default function Lobby() {
    const { code } = useParams<{ code: string}>()
    const navigate = useNavigate()
    const [players, setPlayers] = useState<Player[]>([])


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

        return () => {
            socket.off("lobbyNotFound")
            socket.off("playersUpdated")
        }
    }, [code, navigate])
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
        </div>
    )
}