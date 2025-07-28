// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000; // Porta para o servidor
const MAX_CAPACITY = 40; // Quantidade máxima de partidas
const MATCH_INACTIVITY_TIMEOUT = 1000 * 60 * 50 // 5 minutos
const sysPassord = 'jokenpo2323' // senha do 

//importing utils
const {findOtherPlayer} = require('./serverUtils')

// Configuração do CORS para permitir requisições do frontend
app.use(cors());

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Servir os arquivos estáticos do build do Vite
app.use(express.static(path.join(__dirname, '..', 'jokenpo-frontend', 'dist')));

// Map para armazenar os jogos ativos
// gameId -> { players: Map, status: 'waiting'|'playing'|'roundEnd', lastUpdated: Date }
const games = new Map();


function generateGameId() {
    // TODO implementar teste para averiguar se o ID ja está em uso.
    return generateId()
}
function generatePlayerId() {
    // TODO implementar teste para averiguar se o ID ja está em uso.
    return generateId()
}
function generateId() {
    return Math.random().toString(36).substring(2, 9).toUpperCase(); // ID alfanumérico curto
}


// Função para determinar o vencedor de uma rodada
function determineWinner(choice1, choice2) {
    const winningMoves = {
        'pedra': 'tesoura',
        'papel': 'pedra',
        'tesoura': 'papel'
    };
    if (choice1 === choice2) {
        return 'draw';
    }
    if (winningMoves[choice1] === choice2) {
        return 'P1_wins';
    } else {
        return 'P2_wins';
    }
}

// --- Rotas da API ---

// Rota para criar um novo jogo
app.post('/api/createGame', async (req, res) => {
    // Recusa novos jogos caso o servidor esteja cheio
    if (games.size >= MAX_CAPACITY) {
        res.status(200).json({ error: "Servidor lotado! Tente novamente mais tarde" })
        return
    }
    const gameId = generateGameId(); // ID único para esta jogo
    const playerId = generatePlayerId(); // ID único para este jogador
    const players = new Map([[playerId, { id: playerId, symbol: 'P1', choice: null, isReady: false}]]);

    const game = {
        gameId: gameId,
        players: players,
        status: 'waiting',
        lastUpdated: new Date()
    }
    games.set(gameId, game);
    console.log(`Jogo ${gameId} criado pelo jogador ${playerId} (P1).\n\n`);
    res.status(200).json({ gameId: gameId, playerSymbol: 'P1', playerId: playerId });
});

// Rota para um jogador se juntar a um jogo existente
app.post('/api/joinGame', (req, res) => {
    const { gameId } = req.body;
    const playerId = generatePlayerId(); // ID único para este jogador
    const existingGame = games.get(gameId);

    if (existingGame && existingGame.players.size < 2) {
        //const firstPlayerSymbol = existingGame.players.values().next().value.symbol;
        const newPlayerSymbol = 'P2'//(firstPlayerSymbol === 'P1') ? 'P2' : 'P1';

        existingGame.players.set(playerId, { id: playerId, symbol: newPlayerSymbol, choice: null, isReady: false });
        existingGame.status = 'playing';
        existingGame.lastUpdated = new Date();

        console.log(`Jogador ${playerId} (${newPlayerSymbol}) entrou no jogo ${gameId}. Jogo iniciado.`);
        console.log(existingGame);  // remover
        res.status(200).json({
            gameId: gameId,
            playerSymbol: newPlayerSymbol,
            playerId: playerId,
            status: existingGame.status,
            message: 'Oponente conectado! Esteja pronto!'
        });
    } else {
        res.status(400).json({ error: 'Jogo não encontrado ou cheio.' });
        console.log(`Tentativa de entrar no jogo ${gameId} falhou.`);
    }
});

// Rota para um jogador fazer sua escolha
app.post('/api/makeChoice', (req, res) => {
    const { gameId, playerId, choice } = req.body;
    const game = games.get(gameId);
    console.log(game);  // remover

    if (game && game.players.has(playerId) && game.status === 'playing') {
        console.log(game.players)
        const player = game.players.get(playerId);

        if (player.choice === null) { // Só permite uma escolha por rodada
            player.choice = choice;
            game.lastUpdated = new Date();
            console.log(`Jogador ${player.symbol} fez a escolha: ${choice} no jogo ${gameId}.`);

            // Verificar se ambos os jogadores fizeram suas escolhas
            const allPlayersMadeChoice = Array.from(game.players.values()).every(p => p.choice !== null);

            if (allPlayersMadeChoice) {
                const p1Choice = Array.from(game.players.values()).find(p => p.symbol === 'P1').choice;
                const p2Choice = Array.from(game.players.values()).find(p => p.symbol === 'P2').choice;

                const roundWinner = determineWinner(p1Choice, p2Choice);
                console.log(roundWinner + " game: " + gameId);
                game.status = 'roundEnd'; // Altera o status do jogo para fim de rodada
                game.roundResult = roundWinner; // Armazena o resultado da rodada
                game.player1Choice = p1Choice; // Armazena as escolhas para o estado
                game.player2Choice = p2Choice;

                console.log(`Rodada no jogo ${gameId} finalizada. Resultado: ${roundWinner}`);
            }
            res.status(200).json({ message: 'Escolha registrada.', status: game.status });
        } else {
            res.status(400).json({ error: 'Você já fez sua escolha nesta rodada.' });
        }
    } else {
        res.status(400).json({ error: 'Não é possível fazer movimento agora.' });
    }
});

// Rota para obter o estado atual do jogo (polling)
// app.get('/api/gameState2/', (req, res) => {
//     const { gameId, playerId } = req.query;
//     const game = games.get(gameId);

//     if (game && game.players.has(playerId)) {
//         const currentPlayer = game.players.get(playerId);

//         let opponent = null
//         game.players.forEach(player => {
//             if (player.id !== playerId) opponent = player.id;
//         })

//         let statusMessage = '';
//         let playerChoiceDisplay = currentPlayer.choice ? choiceEmojis[currentPlayer.choice] : '?';
//         let opponentChoiceDisplay = '?';
//         let roundResult = null;
//         let showNextRoundBtn = false;

//         if (game.status === 'waiting') {
//             statusMessage = 'Aguardando outro jogador...';
//         } else if (game.status === 'playing') {
//             const allPlayersMadeChoice = Array.from(game.players.values()).every(p => p.choice !== null);
//             if (allPlayersMadeChoice) {
//                 statusMessage = 'Ambos fizeram suas jogadas. Resultado pronto!';
//             } else if (currentPlayer.choice) {
//                 statusMessage = 'Aguardando a jogada do oponente...';
//             } else {
//                 statusMessage = 'Faça sua jogada!';
//             }
//         } else if (game.status === 'roundEnd') {
//             showNextRoundBtn = true;
//             opponentChoiceDisplay = opponent && opponent.choice ? choiceEmojis[opponent.choice] : '?'; // Revela a escolha do oponente

//             let p1ActualChoice = Array.from(game.players.values()).find(p => p.symbol === 'P1').choice;
//             let p2ActualChoice = Array.from(game.players.values()).find(p => p.symbol === 'P2').choice;

//             const winnerSymbol = determineWinner(p1ActualChoice, p2ActualChoice);

//             if (winnerSymbol === 'draw') {
//                 roundResult = 'Empate!';
//             } else if ((winnerSymbol === 'P1_wins' && currentPlayer.symbol === 'P1') || (winnerSymbol === 'P2_wins' && currentPlayer.symbol === 'P2')) {
//                 roundResult = 'Você venceu!';
//             } else {
//                 roundResult = 'Você perdeu!';
//             }
//             statusMessage = 'Rodada finalizada!';
//         }

//         res.status(200).json({
//             gameId: gameId,
//             playerSymbol: currentPlayer.symbol,
//             playerChoice: playerChoiceDisplay,
//             opponentChoice: opponentChoiceDisplay,
//             status: game.status,
//             statusMessage: statusMessage,
//             roundResult: roundResult,
//             showNextRoundBtn: showNextRoundBtn,
//             canMakeChoice: game.status === 'playing' && currentPlayer.choice === null
//         });
//     } else {
//         res.status(404).json({ error: 'Jogo ou jogador não encontrado.' });
//     }
// });

// Rota para obter o estado atual do jogo (polling)
app.get('/api/gameState/', (req, res) => {
    const { gameId, playerId } = req.query;
    const game = games.get(gameId);
    console.log(game);
    // Se o jogo com o ID existe e o Id do player existe no jogo 
    if (game && game.players.has(playerId)) {
        const currentPlayer = game.players.get(playerId);
        let otherPlayer = findOtherPlayer(game.players, currentPlayer)
        console.log("dentro do IF");
        res.status(200).json({
            gameId: game.gameId,
            // tem erro com player por aqui TODO
            player1: Array.from(game.players.values()).find(player => player.symbol === "P1"),
            player2: Array.from(game.players.values()).find(player => player.symbol === "P2"),
            status: game.status,
            lastUpdated: game.lastUpdated
        })
    } else {
        res.status(404).json({ error: 'Jogo ou jogador não encontrado.' });
    }
});


// Rota para iniciar uma nova rodada
app.post('/api/nextRound', (req, res) => {
    const { gameId, playerId } = req.body;
    const game = games.get(gameId);

    if (game && game.players.has(playerId) && game.status === 'roundEnd') {
        // Limpa as escolhas dos jogadores
        game.players.forEach(p => p.choice = null);
        game.status = 'playing'; // Volta o status para "jogando"
        game.lastUpdated = new Date();
        game.roundResult = null; // Limpa o resultado da rodada anterior
        game.player1Choice = null;
        game.player2Choice = null;

        console.log(`Jogo ${gameId} iniciando nova rodada.`);
        res.status(200).json({ message: 'Nova rodada iniciada.', status: game.status });
    } else {
        res.status(400).json({ error: 'Não é possível iniciar nova rodada agora.' });
    }
});

// Rota para sair do jogo (opcional, para limpar o estado do servidor)
app.post('/api/leaveGame', (req, res) => {
    const { gameId, playerId } = req.body;
    const game = games.get(gameId);

    if (game && game.players.has(playerId)) {
        game.players.delete(playerId);
        if (game.players.size === 0) {
            games.delete(gameId);
            console.log(`Jogo ${gameId} encerrado (todos os jogadores saíram).`);
        } else {
            // Notificar o jogador restante (em um sistema de polling, ele verá a mudança no gameState)
            console.log(`Jogador ${playerId} saiu do jogo ${gameId}.`);
            game.status = 'waiting'; // Jogo volta a esperar por um jogador
            game.lastUpdated = new Date();
        }
        res.status(200).json({ message: 'Você saiu do jogo.' });
    } else {
        res.status(404).json({ error: 'Jogo ou jogador não encontrado.' });
    }
});

// Rota para exibir os jogos ativos
app.post('/api/games', (req, res) => {
    const { userPassword } = req.body
    //console.log(`Tentativa de acesso ao painel de administração com a senha: ${userPassword}`);
    if (userPassword !== sysPassord) {
        return res.status(403).json({ error: 'Acesso negado. Senha incorreta.' });
    } else {
        var activeGames = []
        games.forEach(game => {
            activeGames.push({
                gameId: game.gameId,
                status: game.status,
                players: (() => {
                    const players = []
                    game.players.forEach(player => players.push(player))
                    return players
                })(),
                lastUpdated: game.lastUpdated
            })
        })
        //console.log(`Painel de administração acessado com sucesso. Jogos ativos:\n${activeGames}`);
        //res.status(200).json({games:{games: Array.from(games.values())}});
        res.status(200).json({ games: activeGames });
    }
});

// Confere se a senha dada é igual a do servidor
function checkPass(pass) { return pass == sysPassord ? true : false }
// verifica se o game id dado existe no servidor, se sim o deleta se não retorna um erro
function deleteGame(gameId) {
    if (games.has(gameId)) {
        console.log(`attempting to delete game ${gameId}`)
        games.delete(gameId)
        return true
    } else {
        return false
    }
}
// Rota para deletar um jogo
app.delete("/api/deleteGame", (req, res) => {
    console.log(`Corpo da requisição ${JSON.stringify(req.body)}`)
    if (req.body.userPassword && req.body.gameId) {
        const pass = req.body.userPassword
        const id = req.body.gameId
        // testa a senha e deleta o a sala caso
        if (checkPass(pass) && deleteGame(id)) {
            res.status(200).json({ message: `Game room with id ${id} was succesfully removed` })
        } else {
            res.status(403).json({ message: `Wrong game id\n Passed ID: ${id}` })
        }
    } else {
        res.status(403).json({ message: `Error: Incorrect or missing Passkey and/or game id` })
    }
})

// Rota para servir os demais roteamentos para o frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'jokenpo-frontend', 'dist', 'index.html'));
});

// Mapeamento de escolhas para emojis
const choiceEmojis = {
    'pedra': '🪨',
    'papel': '📃',
    'tesoura': '✂️'
};

// Inicia o servidor Express
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor da API rodando em http://0.0.0.0:${port}`);
});

// mostra os jogos que estão acontecendo a cada 10 segundos
setInterval(() => {
    console.log('\n------------------\nJogos ativos:');
    console.log(' gameId  |  status');
    games.forEach(game => console.log(game.gameId + "  |  " + game.status + "\n---"))
    console.log('---------------------\n');
    // clear games after 2 minutes of inativity
    games.forEach(game => {
        const timeSinceLastUpdate = Date.now() - game.lastUpdated.getTime();
        if (timeSinceLastUpdate > MATCH_INACTIVITY_TIMEOUT) {
            games.delete(game.gameId);
            console.log(`Jogo ${game.gameId} encerrado: Excedeu o tempo de conexão.`);
        }
    })
}, 40000);