export function findOtherPlayer(players, currentPlayer){
    for(const player of players.values()){
        if(player.id !== currentPlayer.id){
            return player.id;
        }
    }
  return undefined;
}