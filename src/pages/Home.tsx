import { Link } from "react-router-dom";
import { categories } from "../data/sampledata";
import { useEffect } from "react";
import { socket } from "../services/sockets";

export default function Home(){

    const handleStart = () => {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)]
        return randomCategory
    }

    useEffect(() => {
        socket.on('connect', () => {
            console.log("Connected to the server!", socket.id)
        })

        return () => {
            socket.off('connect')
        }
    }, [])
    return(
        <div>
            <h1>Category game</h1>
            <Link to="/game" state={{ category : handleStart()}}>
                <button>Start</button>
            </Link>
        </div>
    )
}