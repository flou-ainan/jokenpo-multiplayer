import { useEffect } from "react"
import { Link } from "react-router-dom"
import toast, {Toaster} from "react-hot-toast"
import { useLog } from "../utils";
const log = useLog(toast)
export default function AdminPanel({apiResponse, error, setApiResponse, password, serverUrl}) {
    
    
    // efeito que condicona um intervalo para chamadas periódicas
    // com setInterval e limpa o intervalo com clearInterval caso
    // o componente seja desmontado ou atualizado
    useEffect(() => {
        const interval = setInterval(getGames, 3000); // Chama a cada 3 segundos
        // Limpa o intervalo quando o componente é desmontado
        return () => clearInterval(interval);
        }, []); // Executa apenas uma vez quando o componente é montado
        
        // Deleta jogo via delete request na API

        async function getGames(){
            fetch(serverUrl + '/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userPassword: password })
            })
                .then(response => response.json())
                .then(data => {
                    setApiResponse(data);
                    if(apiResponse.games){
                        console.log(apiResponse.games.map(game => (game + "\n ---\n")))
                    }
                })
                .catch(err => {
                    console.error("Erro ao buscar dados do servidor:", err);
                    setApiResponse({ error: "Erro ao buscar dados do servidor" });
                });
        }

        async function deleteGame(gameId) {
            try{
                const res = await fetch(serverUrl+'/api/deleteGame', {
                method: "DELETE",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userPassword: password, gameId: gameId})
                })
                
                if (!res.ok){throw new Error('Erro de conexão')}

                const data = await res.json()
                getGames()
                log(data.message,"success")
                //alert(data.message)
            }catch(err){
                log(err, "error")
            }
            
        }        
        // Organizes api data into ui components
        function loadGamesList(){
            return apiResponse && apiResponse.games && apiResponse.games.length > 0 ? (
                <ul className="pl-5">
                    {apiResponse.games.map((game, index) => (
                        <li className="mb-4" key={index}>
                            <strong>Game ID:</strong> {game.gameId} <br />
                            <strong>Status:</strong> {game.status} <br />
                            <strong>Players:</strong>{(() => {
                                const [p1, p2] = [game.players[0], game.players[1] ? game.players[1] : {symbol: 'P2', id: "waiting"}]
                                let result = ' '
                                result += p1.symbol + ": " + p1.id+ " - " + p2.symbol+": " + p2.id
                                return result
                                })()}
                            <br />
                            <strong>Last updated at:</strong> {new Date(game.lastUpdated).toLocaleString()} <br />
                            {/* remove game button */}
                            <button 
                            className="scale-[0.8] btn-red"
                            onClick={()=>deleteGame(game.gameId)}>
                                Remove Game
                            </button>
                            <hr />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum jogo ativo no momento.</p>
            );
        }
    return (
        // Fundo de sobreposição (overlay) que fixa o painel no centro
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 flex-col">
            <Toaster position="top-right" />
            {/* O painel do modal, que contém o conteúdo */}
            <Link className="m-2 text-left w-[95vw] max-w-4xl" to={"/"}>Voltar</Link>
            <div className="bg-gray-700 p-6 rounded-lg shadow-xl w-[95vw] max-w-4xl flex flex-col max-h-[90vh]">
                <h3 className="text-xl font-bold mb-4 flex-shrink-0">Painel de Administração</h3>
                {apiResponse && (
                    // Esta área se torna rolável quando o conteúdo excede o espaço
                    <div className="overflow-y-auto">
                        {loadGamesList()}
                    </div>
                )}
                {error && <p className="text-red-500 mt-2 flex-shrink-0">{error}</p>}
            </div>
        </div>
    );

}