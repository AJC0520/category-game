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

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <h1>Category is {category.name}</h1>
            <p>What are the answers?</p>
            <input type="text" ref={inputRef} onChange={handleChange}/>
            <p>Total score: {totalScore}</p>
            
            {foundAnswers.map(answer => (
                <div className="display-answers">
                    <p key={answer.text}>{answer.text}</p>
                    <p key={answer.obscurityScore}>{answer.obscurityScore}</p>
                </div>
            ))}
        </div>
    )
    
}