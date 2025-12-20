import { useLocation } from "react-router-dom"
import type { Category, Answer } from "../types/game.types"
import { useEffect, useRef, useState } from "react"
import "./Game.css"

export default function Game(){
    const location = useLocation()
    const category = location.state?.category as Category
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
            return
        }

        const interval = setInterval(() => {
            setTimer(prev => prev - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [timer, remainingAnswers.length])

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