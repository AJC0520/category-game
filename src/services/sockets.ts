import { io } from 'socket.io-client'

// Use environment variable or fallback to localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://10.22.62.179:3001'
export const socket = io(SOCKET_URL)