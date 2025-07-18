import { useState } from 'react'
import './App.css'
import Start from './components/Start.jsx'
import CreateGame from './components/CreateGame.jsx'
import JoinGame from './components/JoinGame.jsx'
import Playing from './components/Playing.jsx'

// Define the server URL from environment variables or default to localhost
// This allows for easy configuration of the server URL in different environments
//const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const serverUrl = ''

function App() {
  const [gameId, setGameId] = useState()
  const [playerId, setPlayerId] = useState()
  const [gameState, setGameState] = useState("start")

// export VITE_SERVER_URL="http://34.9.159.96:3000/"
  function stateLoad(){
    switch(gameState){
      case "start":
        return <Start onCreateGame={setCreateGame} onJoinGame={joinGame} />
      case "createGame":
        return <CreateGame 
          gameId={gameId}  setGameId={setGameId}
          playerId={playerId} setPlayerId={setPlayerId} 
          serverUrl={serverUrl} setGameState={setGameState}
        />
      case "joinGame":
        return <JoinGame 
          setGameState={setGameState} gameId={gameId}
          setGameId={setGameId} playerId={playerId}
          setPlayerId={setPlayerId} />
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

export default App
