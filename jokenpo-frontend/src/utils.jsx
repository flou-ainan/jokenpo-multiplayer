export const useLog = (toast) => {
    return (message, mode) => {
        console.log(message)
        if(mode == undefined) toast(message)
        switch(mode){
            case "error":
                toast.error(JSON.stringify(message))
            break
            case "success":
                toast.success(JSON.stringify(message))
            break
        }
    }
}

export const useToastConfirm = (toast) => {
    return (question, ifTrue, ifFalse) => {
        let answer = false      
        toast((t) => (
            <span>
                {question}
                <br />
                <button className="scale-[0.7]" onClick={() => {
                    answer = true;
                    ifTrue()
                    toast.dismiss(t.id)
                }}>
                    Accept
                </button>
                <button className="bg-red-800 scale-[0.7]" onClick={() => {
                    answer = false;
                    ifFalse !== undefined ? ifFalse() : 
                    toast.dismiss(t.id)
                }}>
                    Decline
                </button>
            </span>
        ),{duration:8000000});
        return answer
    }
}


// Chama api para saber status da partida
// Exige dados da "useAppStore" do zustand
export async function getGameStatus(serverUrl, gameId, playerId, setData){
    try {
      const res = await fetch(`${serverUrl}/api/gameState?gameId=${gameId}&playerId=${playerId}`,{
        method:"GET",
        headers: {'Content-Type':'Application/json'},
      })
      const json = await res.json()
      setData(json)
      return json
    }catch(err){
      console.log("Erro: "+err.message, "error")
      return err
    }
}