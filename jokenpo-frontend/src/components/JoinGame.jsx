import { useAppStore } from "../store"
export default function JoinGame() {
  const setGameState = useAppStore(state => state.setGameState)
    return (
        <div className="flex flex-col items-center justify-center gap-4">
          <h3 className="text-2xl font-bold">Join Game</h3>
          <p>Functionality to join an existing game will be implemented here.</p>
          <button className="bg-red-900 rounded p-2 text-2xl" onClick={() => setGameState('start')}>
            Return to Main Menu
          </button>
        </div>
    )
}
