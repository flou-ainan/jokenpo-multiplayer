import { useAppStore } from '../store.js'
export default function CreateGame() {
// Initializing State Variables
  const setGameState = useAppStore(state => state.setGameState)
  const gameId = useAppStore(state => state.gameId)
  const setGameId = useAppStore(state => state.setGameId)
  const playerId = useAppStore(state => state.playerId)
  const setPlayerId = useAppStore(state => state.setPlayerId)
  const serverUrl = useAppStore(state => state.serverUrl)
  
  //calls API on /createGame and returns gameId
  async function getGameId() {
    try{
      const res = await fetch(serverUrl+'/api/createGame', {method: 'POST'})
      const data = await res.json()
      setGameId(data.gameId)
      setPlayerId(data.playerId)
    } catch (err) {
      console.log(err)
      alert(err)
    }
  }
  
  
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <button onClick={() => {
                if(!gameId) getGameId()
                else {
                if (confirm("Room already created!\n Create another room?")){
                  getGameId()
                }
              }
            }}>Generate room</button>
            {gameId && (
                <div>
                    <p>Your Player ID is:</p>
                    <h3>{playerId}</h3>
                    <br />
                    <p>Your room ID is:</p>
                    <h3 className="font-bold">{gameId}</h3>
                    <br />
                    <p>Share your room ID with your friend to play together!</p>
                    <small alt="Copy this code and send it to your friend,
                      ask him to access the game on his web browser, click joing game and paste this code.">Know more...</small>
                    <br />
                    <p>Waiting for player 2 to join...</p>
            </div>
        )}
        <br />
            <button onClick={() => setGameState('start')}>
                Return to Main Menu
            </button>
        </div>
    )
}
