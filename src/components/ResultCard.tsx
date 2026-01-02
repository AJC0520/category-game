import "./ResultCard.css";

interface GameResult {
    playerName: string;
    score: number;
    foundAnswers: { text: string; obscurityScore: number }[];
    foundAnswersCount: number;
    totalAnswers: number;
}

interface ResultCardProps {
    gameResults: GameResult;
    rank?: number;
}

export default function ResultCard({ gameResults, rank }: ResultCardProps) {
    return (
        <div className="result-container">
            <header>
                <p>{rank && `#${rank} `}{gameResults.playerName}</p>
                <p className="score-text">Score: {gameResults.score}</p>
            </header>
            <ul>
                {gameResults.foundAnswers && gameResults.foundAnswers.map((answer) => (
                    <li key={answer.text}>
                        {answer.text} <span>{answer.obscurityScore}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
