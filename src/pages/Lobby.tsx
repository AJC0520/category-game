import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

type Player = {
    id: string
    name: string
}

export default function Lobby() {
    const { code } = useParams<{ code: string}>()
    
    useEffect(() => {
   
    })
    return(
        <div>
            
        </div>
    )
}