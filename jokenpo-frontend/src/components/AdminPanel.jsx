import { useEffect } from "react";

export default function AdminPanel({apiResponse, error, handleLogin, setApiResponse, password, serverUrl}) {
    // efeito que condicona um intervalo para chamadas periódicas
    // com setInterval e limpa o intervalo com clearInterval caso
    // o componente seja desmontado ou atualizado
    useEffect(() => {
        const interval = setInterval(() => {
            fetch(import.meta.env.VITE_SERVER_URL || serverUrl + '/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userPassword: password })
            })
                .then(response => response.json())
                .then(data => {
                    setApiResponse(data);
                })
                .catch(err => {
                    console.error("Erro ao buscar dados do servidor:", err);
                    setApiResponse({ error: "Erro ao buscar dados do servidor" });
                });
        }, 3000); // Chama a cada 3 segundos
        // Limpa o intervalo quando o componente é desmontado
        return () => clearInterval(interval);
        }, []); // Executa apenas uma vez quando o componente é 
        
        function loadGamesList(){
            return apiResponse && apiResponse.games && apiResponse.games.length > 0 ? (
                <ul className="pl-5">
                    {apiResponse.games.map((game, index) => (
                        <li className="mb-4" key={index}>
                            <strong>Game ID:</strong> {game.gameId} <br />
                            <strong>Status:</strong> {game.status} <br />
                            <strong>Players:</strong> {game.players.map(player => player.playerId).join(', ')} <br />
                            <strong>Created At:</strong> {new Date(game.createdAt).toLocaleString()} <br />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum jogo ativo no momento.</p>
            );
        }
    return (
        <div>
            <h3>Painel de Administração</h3>
            {apiResponse && (
                <div className="mt-4">
                    {loadGamesList()}
                </div>
            )}
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );

}