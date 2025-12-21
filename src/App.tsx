import Home from './pages/Home'
import Game from './pages/Game'
import Lobby from './pages/Lobby'
import './App.css'
import { Route, Routes } from 'react-router-dom'

function App() {

  return (
    <Routes> 
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/lobby/:code" element={<Lobby />} />
    </Routes>
  )
}

export default App
