import { useLocation, useNavigate } from "react-router-dom"
import type { Category, Answer } from "../types/game.types"
import { useEffect, useRef, useState } from "react"
import { socket } from "../services/sockets"

import "./Game.css"

export default function Game(){
    const location = useLocation()
    const navigate = useNavigate()

    // Handle both single-player and multiplayer data structures
    const category = (location.state?.category || location.state?.gameData?.category) as Category
    const isMultiplayer = !!location.state?.code
    const lobbyCode = location.state?.code
    const players = location.state?.players || []
    
    if (!category) {
        return <div>Error: No game data available</div>
    }
    
    const answers = category.answers

    const [remainingAnswers, setRemainingAnswers] = useState<Answer[]>(category.answers)
    const [totalScore, setTotalScore] = useState(0)
    const [foundAnswers, setFoundAnswers] = useState<Answer[]>([])
    const [timer, setTimer] = useState(60)
    const [isGameOver, setIsGameOver] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    useEffect(() => {
        if (timer <= 0 || remainingAnswers.length === 0){
            setIsGameOver(true)
            
            // If multiplayer and timer ran out, send results to server
            if (isMultiplayer && lobbyCode && timer <= 0) {
                socket.emit("gameFinished", {
                    code: lobbyCode,
                    playerId: socket.id,
                    score: totalScore,
                    foundAnswers: foundAnswers.length,
                    totalAnswers: answers.length
                })
            }
            
            return
        }

        const interval = setInterval(() => {
            setTimer(prev => prev - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [timer, remainingAnswers.length, isMultiplayer, lobbyCode, totalScore, foundAnswers, answers.length])

    useEffect(() => {
        if (!isMultiplayer) return

        socket.on("returnToLobby", (gameResults) => {
            navigate(`/lobby/${lobbyCode}`, { state: { gameResults } })
        })

        return () => {
            socket.off("returnToLobby")
        }
    }, [isMultiplayer, lobbyCode, navigate])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(isGameOver) return
        const inputValue = e.target.value.toLowerCase().trim()

        const foundAnswer = remainingAnswers.find(answer => 
            answer.text.toLowerCase() === inputValue
        )
        

        if(foundAnswer){
            setTotalScore(totalScore + foundAnswer.obscurityScore)
            setRemainingAnswers(remainingAnswers.filter(answer => answer !== foundAnswer))
            setFoundAnswers([...foundAnswers, foundAnswer])
            e.target.value = ""
        }
    }

    return(
        <div>
            <h2>Time: {timer}s</h2>
            <h1>Category: {category.name}</h1>
            {isGameOver ? (
                <div>
                    <h2>Game Over!</h2>
                    <p>Final Score: {totalScore}</p>
                    <p>Found {foundAnswers.length} out of {answers.length} answers</p>
                </div>
            ) : (
                <>
                    <p>What are the answers?</p>
                    <input type="text" ref={inputRef} onChange={handleChange}/>
                    <p>Score: {totalScore}</p>
                    
                    {foundAnswers.map(answer => (
                        <div className="display-answers" key={answer.text}>
                            <p>{answer.text}</p>
                            <p>{answer.obscurityScore}</p>
                        </div>
                    ))}
                </>
            )}
        </div>
    )
    
}