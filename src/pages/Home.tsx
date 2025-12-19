import { Link } from "react-router-dom";
import { categories } from "../data/sampledata";

export default function Home(){

    const handleStart = () => {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)]
        return randomCategory
    }
    return(
        <div>
            <h1>Category game</h1>
            <Link to="/game" state={{ category : handleStart()}}>
                <button>Start</button>
            </Link>
        </div>
    )
}