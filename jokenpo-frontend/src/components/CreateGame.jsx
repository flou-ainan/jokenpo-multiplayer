import toast, { Toaster } from 'react-hot-toast'
import GameData from './GameData.jsx'
import { useState, useEffect } from 'react'
import { useAppStore, useDataStore } from '../store.js'
import {DualRing} from 'react-css-spinners'
import {useLog, useToastConfirm, getGameStatus} from '../utils.jsx'


export default function CreateGame() {
// Initializing State Variables
  const setGameState = useAppStore(state => state.setGameState)
  const gameId = useAppStore(state => state.gameId)
  const setGameId = useAppStore(state => state.setGameId)
  const playerId = useAppStore(state => state.playerId)
  const setPlayerId = useAppStore(state => state.setPlayerId)
  const serverUrl = useAppStore(state => state.serverUrl)
  const data = useDataStore(state => state.data)
  const setData = useDataStore(state => state.setData)

// local state
  const [isWaiting, setWaiting] = useState(false)
  const [intervalId, setIntervalId] = useState()
  //const [data, setData] = useState()

// allowing log function  
  const log = useLog(toast)
  const question = useToastConfirm(toast)

  //calls API on /createGame and returns gameId
  async function getGameId() {
    try{
      const res = await fetch(serverUrl+'/api/createGame', {method: 'POST'})
      const json = await res.json()
      setGameId(json.gameId)
      setPlayerId(json.playerId)
    } catch (err) {
      log(err.message + " | " + data,"error")
    }
  }

  function checkP2Join(game){
    if(game?.player2 && game.player2.symbol === "P2"){
      log(`Player ${game.player2.id} conected`, 'success')
      setTimeout(()=>{
        setGameState('playing')
      },3500)
    } 
  }
  async function getGameStatusAndCheckP2(){
    const json = await getGameStatus(serverUrl, gameId, playerId, setData)
    checkP2Join(json)
  }

  // Cria intervalo para acessar api de tempos em tempos.
  useEffect(()=>{
    let interval
    if(isWaiting){
      toast("esperando")
      interval = setInterval(()=>{
        getGameStatusAndCheckP2()
      },2000)
      setIntervalId(interval)
    }else{
      if(interval){
        toast(`Limpando intervalo: ${interval}`)
        clearInterval(interval)
      }
    }
    //corrigir este intervalo TODO
    return () => {clearInterval(interval)}
  },[isWaiting, data])

//   useEffect(()=>{
//   let interval; // Variável local para armazenar o ID do intervalo
//   if(isWaiting){
//     toast("Esperando oponente...")
//     interval = setInterval(()=>{ // O ID do intervalo é atribuído a 'interval'
//       getGameStatusAndCheckP2()
//     },2000);
//   } else {
//     toast("Não esperando.")
//   }
//   // ...
//   return () => {
//     if (interval) { // A função de limpeza usa o 'interval' capturado
//       toast(`Limpando intervalo: ${interval}`);
//       clearInterval(interval);
//     }
//   };
// },[isWaiting, gameId, playerId, serverUrl]); // Dependências atualizadas
  return (
      <>
        <div className="flex flex-col items-center justify-center gap-4">
            <button onClick={() => {
                if(!gameId) getGameId()
                else {
                question("Room already created!\n Create another room?", function(){
                  getGameId()
                })}
              }}>Generate room
            </button>
            {gameId && (
                <div>
                    <p>Your Player ID is:</p>
                    <h3>{playerId}</h3>
                    <p>Your room ID is:</p>
                    <h3 className="font-bold">{gameId}</h3>
                    <br />
                    <p>Share your room ID with your friend to play together!</p>
                    <details>
                      <summary><small alt="">Know more...</small></summary>
                      <ol className='text-left'>
                        <li>1 - Copy this code and send it to your friend (Whatsapp, Telegram)</li>
                        <li>2 - Ask him to access the game on his web browser</li>
                        <li>3 - He/she will click Joing Game.</li>
                        <li>4 - He/she will paste this code on the form and click Join Game.</li>
                      </ol>
                    </details>
                    <br />
                    <input 
                      type="checkbox" 
                      onChange={(e)=>setWaiting(e.target.checked)} 
                      checked={isWaiting} className="scale-[1.8] p-3 mr-3"
                    /> 
                    Waiting your partner ?
                    <br />
                    {isWaiting && <>
                      <DualRing className='p-7' />
                      <div className='text-black bg-gray-400 rounded-3xl p-2'>
                        <GameData game={data} showSensitive={false} />
                      </div>
                    </>
                    }
                </div>
            )}
        <br />
            <button onClick={() => setGameState('start')}>
                Return to Main Menu
            </button>
        </div>

        <Toaster 
          position='top-right'
        />
      </>
  )
}