import { useState } from 'react'
import './App.css'
function App() {
  const [gameId, setGameId] = useState()
  //calls API on /createGame and returns gameId
  async function getGameId() {
    try{
      const res = await fetch('/api/createGame', {method: 'GET'})
      // if (!res.ok) {
      //   throw new Error('Criação de jogo falhou')
      // }
      const data = await res.json()
      setGameId(data.gameId)
    } catch (err) {
      console.log(err)
      alert(err)
    }
  }


  return (
    <>
      <h1>Joken Po Online</h1>
      <button onClick={getGameId}>Criar Jogo</button>
      <p>Your game ID is:</p>
      <h3>{gameId}</h3>
    </>
  )
}

export default App
