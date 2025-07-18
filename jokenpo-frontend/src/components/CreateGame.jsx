export default function CreateGame({ gameId, setGameId, setPlayerId, serverUrl, playerId, setGameState }) {
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
        <div className="flex flex-col items-center justify-center gap-4">
            <button onClick={() => {
                if(!gameId) getGameId()
                else alert("Room already created!")
            }}>Generate room</button>
            {gameId && (
                <div>
                    <p>Your Player ID is:</p>
                    <h3>{playerId}</h3>
                    <br />
                    <p>Your room ID is:</p>
                    <h3 className="font-bold">{gameId}</h3>
                    <br />
                    <p>Share this room ID with your friends to play together!</p>
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
