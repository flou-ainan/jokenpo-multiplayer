import Player from "./Player"
import { Hourglass } from "react-css-spinners"
export default function GameData({game, showSensitive}){
    if(!game){
        return<h3>No game Loaded</h3>
    }
    return(
    <ul>
        <li>GameID: {game.gameId}</li>
        <li><Player player={game.player1} showSensitive={showSensitive}/></li>
        <li><Player player={game.player2} showSensitive={showSensitive}/></li>
        <li>Game status: {
            game.status === "waiting"? <b>Waiting <Hourglass color="#41474fff" size="12"/></b> : <b>{game.status}</b>
        }</li>
        <li>Last updated: {(new Date(game.lastUpdated)).toLocaleString()}</li>
    </ul>
    )
}