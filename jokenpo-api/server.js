// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000; // Porta para o servidor
const MAX_CAPACITY = 4; // Quantidade máxima de partidas


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
app.get('/api/createGame', (req, res) => {
    // Recusa novos jogos caso o servidor esteja cheio
    if(games.size >= MAX_CAPACITY) res.status(200).json({error: "Servidor lotado! Tente novamente mais tarde"})
    const gameId = generateGameId(); // ID único para esta jogo
    const playerId = generatePlayerId(); // ID único para este jogador
    const players = new Map([[playerId, { id: playerId, symbol: 'P1', choice: null }]]);
    players.set(playerId, { id: playerId, symbol: 'P1', choice: null });
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
        const firstPlayerSymbol = existingGame.players.values().next().value.symbol;
        const newPlayerSymbol = (firstPlayerSymbol === 'P1') ? 'P2' : 'P1';
        
        existingGame.players.set(playerId, { id: playerId, symbol: newPlayerSymbol, choice: null });
        existingGame.status = 'playing';
        existingGame.lastUpdated = new Date();
        
        console.log(`Jogador ${playerId} (${newPlayerSymbol}) entrou no jogo ${gameId}. Jogo iniciado.`);
        console.log(existingGame);  // remover
        res.status(200).json({ 
            gameId: gameId, 
            playerSymbol: newPlayerSymbol, 
            playerId: playerId,
            status: existingGame.status,
            message: 'Oponente conectado! Faça sua jogada!'
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
                console.log(roundWinner+" game: "+gameId);
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
app.get('/api/gameState/:gameId/:playerId', (req, res) => {
    const { gameId, playerId } = req.params;
    const game = games.get(gameId);

    if (game && game.players.has(playerId)) {
        const currentPlayer = game.players.get(playerId);
        const opponent = Array.from(game.players.values()).find(p => p.id !== playerId);

        let statusMessage = '';
        let playerChoiceDisplay = currentPlayer.choice ? choiceEmojis[currentPlayer.choice] : '?';
        let opponentChoiceDisplay = '?';
        let roundResult = null;
        let showNextRoundBtn = false;

        if (game.status === 'waiting') {
            statusMessage = 'Aguardando outro jogador...';
        } else if (game.status === 'playing') {
            const allPlayersMadeChoice = Array.from(game.players.values()).every(p => p.choice !== null);
            if (allPlayersMadeChoice) {
                statusMessage = 'Ambos fizeram suas jogadas. Resultado pronto!';
            } else if (currentPlayer.choice) {
                statusMessage = 'Aguardando a jogada do oponente...';
            } else {
                statusMessage = 'Faça sua jogada!';
            }
        } else if (game.status === 'roundEnd') {
            showNextRoundBtn = true;
            opponentChoiceDisplay = opponent.choice ? choiceEmojis[opponent.choice] : '?'; // Revela a escolha do oponente
            
            let p1ActualChoice = Array.from(game.players.values()).find(p => p.symbol === 'P1').choice;
            let p2ActualChoice = Array.from(game.players.values()).find(p => p.symbol === 'P2').choice;

            const winnerSymbol = determineWinner(p1ActualChoice, p2ActualChoice);
            
            if (winnerSymbol === 'draw') {
                roundResult = 'Empate!';
            } else if ((winnerSymbol === 'P1_wins' && currentPlayer.symbol === 'P1') || (winnerSymbol === 'P2_wins' && currentPlayer.symbol === 'P2')) {
                roundResult = 'Você venceu!';
            } else {
                roundResult = 'Você perdeu!';
            }
            statusMessage = 'Rodada finalizada!';
        }

        res.status(200).json({
            gameId: gameId,
            playerSymbol: currentPlayer.symbol,
            playerChoice: playerChoiceDisplay,
            opponentChoice: opponentChoiceDisplay,
            status: game.status,
            statusMessage: statusMessage,
            roundResult: roundResult,
            showNextRoundBtn: showNextRoundBtn,
            canMakeChoice: game.status === 'playing' && currentPlayer.choice === null
        });
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

// O "catchall" handler: para qualquer requisição que não corresponda a uma
// das rotas da API, envie de volta o arquivo index.html do React/Vite.
// Isso é necessário para que o roteamento do lado do cliente funcione.
app.get('/', (req, res) => {
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
    games.forEach(game => console.log(game.gameId+"  |  "+game.status+"\n---"))
    console.log('---------------------\n');
    // clear games after 2 minutes of inativity
    games.forEach(game => {
        const timeSinceLastUpdate = Date.now() - game.lastUpdated.getTime();
        if (timeSinceLastUpdate > 120000) {
            games.delete(game.gameId);
            console.log(`Jogo ${game.gameId} encerrado: Excedeu o tempo de conexão.`);
        }
    })
}, 4000);