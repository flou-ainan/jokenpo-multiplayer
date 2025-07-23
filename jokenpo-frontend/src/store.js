import {create} from 'zustand';

export const useAppStore = create( (set) => ({
    // gameId
    gameId: null,
    setGameId: (gameId) => {
        set({gameId: gameId})
    },
    // playerId
    playerId: null,
    setPlayerId: (playerId) => {
        set({playerId: playerId})
    },
    // gameState
    gameState: "start",
    setGameState: (gameState) => {
        set((state) =>({gameState: gameState}))
    },
    // serverUrl
    serverUrl: "start",
    setServerUrl: (serverUrl) => {
        set((state) =>({serverUrl: serverUrl}))
    }
}));