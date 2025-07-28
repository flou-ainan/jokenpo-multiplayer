  // Player comnponent
import {Ellipsis} from 'react-css-spinners'  
export default function Player({player, showSenstive}){
    if(!player){
        return<div className='bg-gray-200 p-2 rounded-lg m-2'><Ellipsis color="#313b49ff"/></div>
    }
    let[id, symbol, choice, isReady] = [player.id, player.symbol, player.choice, player.isReady]  
    let thisChoice = choice? choice : "Waiting..." 
    const playerText = symbol ? `Player ${symbol.slice(1)}` : "Corrupted data"
    return(
    <div className='bg-gray-200 p-2 rounded-lg m-2'>
      <ul>
        <li><b>{playerText}</b></li>
        <li>ID: {id}</li>
        {showSenstive &&<>
        <li>Choice: {thisChoice}</li>
        <li>Ready: {isReady ? "✅":"⌛️"}</li>
        </>
        }
      </ul>
    </div>)
  }


  // Player obj definition

  //player = {
  //  id: '4W05GJU',
  //  symbol: 'P1',
  //  choice: null
  //}

