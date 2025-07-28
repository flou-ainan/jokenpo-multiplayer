import {useState} from "react"
import { useAppStore } from "../store"
import toast, {Toaster} from "react-hot-toast"

export default function JoinGame() {
  const setGameState = useAppStore(state => state.setGameState)
  const setGameId = useAppStore(state => state.setGameId)
  const serverUrl = useAppStore(state => state.serverUrl)
  const setIsHost = useAppStore(state => state.setIsHost)

  const [inputGameId, setInputGameId] = useState()
  //const [fetchedJson, setFetchedJson] = useState()
  
  const myToast = (data) =>{
      toast.custom((t) => (
        <div
          className={`bg-gray-700 px-6 py-4 shadow-md rounded-xl ${t.visible ? 'animate-enter' : 'animate-leave'
            }`}
        >
          {data}
        </div>
      ));
  }
  async function joinGame(gameId){
   // toast(`Your game id is: ${inputGameId}`);
    fetch(serverUrl + "/api/joinGame", {
      method: "POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({gameId:gameId})
    })
    .then(res => {
      if(!res.ok){
        throw new Error(`${res.status}`)
      }
      return res.json()
    })
    .then(data => {
      console.log(data)
      //myToast(JSON.stringify(data))
      //setFetchedJson(data)
      setGameId(data.gameId)
      toast.success((t) => (
        <span>
          Your Game ID: {data.gameId}<br />
          You are Player: {data.playerSymbol}<br />
          Your Player Id is: {data.playerId}<br />
        </span>
      ));
      setTimeout(() => setGameState("playing"),2500)
      setIsHost(false)
    })
    .catch(err => {
      console.log(`Erro: ${err}`)
      myToast(`${err}`)
    })
  }
  function handleIdInputChange(gameId){
    setInputGameId(gameId.toUpperCase())
  }
  function handleJoinGame(e){
    e.preventDefault()
    joinGame(inputGameId)
  }
    return (
      <>
        <Toaster
          position="top-right"
          className="scale-[2]"
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <h3 className="text-2xl font-bold">Join Game</h3>
          <form className="flex flex-col gap-4" onSubmit={handleJoinGame}>
            <input type="text" 
              value={inputGameId}
              onChange={(e) => handleIdInputChange(e.target.value)}
              placeholder="Game room ID you that you recieved"
              className="bg-gray-900 p-2 rounded-lg"
            />
            <input type="submit" className="p-2 rounded bg-gray-400 hover:bg-gray-500 max-w-xs" value="Join Game"/>
          </form>
          <button className="bg-red-900 rounded p-2 text-2xl" onClick={() => setGameState('start')}>
            Return to Main Menu
          </button>
        </div>
      </>
    )
}
