import { useAppStore } from '../store'
import {shallow} from 'zustand/shallow'
import '../App.css'
import Start from '../components/Start.jsx'
import CreateGame from '../components/CreateGame.jsx'
import JoinGame from '../components/JoinGame.jsx'
import Playing from '../components/Playing.jsx'

// Define the server URL from environment variables or default to localhost
// This allows for easy configuration of the server URL in different environments

export default function Home() {
  const serverUrl = useAppStore(state => state.serverUrl)
  const setServerUrl = useAppStore(state => state.setServerUrl)
  setServerUrl(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000')

  const setGameId = useAppStore(state => state.setGameId)
  const setPlayerId = useAppStore(state => state.setPlayerId) 
  const gameState = useAppStore(state => state.gameState)
  const setGameState = useAppStore(state => state.setGameState)

// export VITE_SERVER_URL="http://34.9.159.96:3000"
  function stateLoad(){
    switch(gameState){
      case "start":
        return <Start />
      case "createGame":
        return <CreateGame />
      case "joinGame":
        return <JoinGame />
      case "playing":
        return <Playing />
      default:
        alert("Invalid game state")
        setGameId(null)
        setPlayerId(null)
        return <Start />
    } 
  }
  //function to create a game
  function setCreateGame() {
    setGameState("createGame")
  }
  //function to join a game
  function joinGame() {
    setGameState("joinGame")
  }

  //calls API on /createGame and returns gameId
  async function getGameId() {
    try{
      const res = await fetch(serverUrl+'/api/createGame', {method: 'GET'})
      const data = await res.json()
      setGameId(data.gameId)
      setPlayerId(data.playerId)
    } catch (err) {
      console.log(err)
      alert(err)
    }
  }
  return (
    <>
    {stateLoad()}
    </>
  )
}

