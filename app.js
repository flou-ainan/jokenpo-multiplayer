// app.js
const http = require('http');
const fs = require('fs'); // Módulo para trabalhar com o sistema de arquivos
const path = require('path'); // Módulo para trabalhar com caminhos de arquivos

const hostname = '0.0.0.0'; // Escuta em todas as interfaces de rede
const port = 80; // Porta que o servidor Node.js vai escutar

const server = http.createServer((req, res) => {
  // Verifica se a requisição é para a raiz do site (/)
  if (req.url === '/' && req.method === 'GET') {
    // Constrói o caminho completo para o arquivo index.html
    const filePath = path.join(__dirname, 'index.html');

    // Lê o arquivo HTML de forma assíncrona
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Se houver um erro ao ler o arquivo (ex: não encontrado)
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Erro interno do servidor ao carregar a página.\n');
        console.error('Erro ao ler index.html:', err);
        return;
      }

      // Se a leitura for bem-sucedida, envia o conteúdo HTML
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html'); // Define o tipo de conteúdo como HTML
      res.end(data); // Envia o conteúdo do arquivo
    });
  } else {
    // Para qualquer outra rota ou método, retorna "Não encontrado"
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Não encontrado\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Servidor rodando em https://${hostname}:${port}/`);
});
     