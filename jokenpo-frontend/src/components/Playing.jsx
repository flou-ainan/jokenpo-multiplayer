import { getGameStatus } from "../utils"
import GameData from './GameData.jsx'
import { useDataStore } from "../store"
import { Toaster } from "react-hot-toast"

export default function Playing() {
  // Initializing State Variables
  const setGameState = useAppStore(state => state.setGameState)
  const gameId = useAppStore(state => state.gameId)
  const playerId = useAppStore(state => state.playerId)
  const serverUrl = useAppStore(state => state.serverUrl)
  const data = useDataStore(state => state.data)
  const setData = useDataStore(state => state.setData)

  // local state
  const [isWaiting, setWaiting] = useState(true)
  const [intervalId, setIntervalId] = useState()
    

  // Cria intervalo para acessar api de tempos em tempos.
  useEffect(() => {
    let interval
    if (isWaiting) {
      toast("esperando")
      interval = setInterval(() => {
        getGameStatus(serverUrl, gameId, playerId, setData)
      }, 2000)
      setIntervalId(interval)
    } else {
      if (interval) {
        toast(`Limpando intervalo: ${interval}`)
        clearInterval(interval)
      }
    }
    //corrigir este intervalo TODO
    return () => { clearInterval(interval) }
  }, [isWaiting, data])


    return (
      <>
        {isDebug && <div>
          <Toaster/>
        </div>}
        <div className="start">
          <h3>Playing</h3>
        </div>
      </>
    )
}
