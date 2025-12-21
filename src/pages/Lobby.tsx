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

    useEffect(() => {
        socket.emit("joinLobby", code)

        socket.on("lobbyNotFound", () => {
            alert("not found")
            navigate("/")
        })

        return () => {
            socket.off("lobbyNotFound")
        }
    }, [code, navigate])
    return(
        <div>
            <h1>{code}</h1>
        </div>
    )
}