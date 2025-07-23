#!/bin/bash

# Este script inicia o servidor da API jokenpo em modo de produção.
# Ele detecta o endereço IP da máquina, o define como uma variável de ambiente
# e inicia o servidor Node.js em segundo plano.

# Obtenha o primeiro endereço IP local da máquina.
# 'hostname -I' pode retornar múltiplos IPs; 'awk' pega o primeiro.
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# Verifica se o endereço IP foi obtido com sucesso.
if [ -z "$IP_ADDRESS" ]; then
  echo "Erro: Não foi possível determinar o endereço IP."
  exit 1
fi

# Exporta a variável de ambiente para que o frontend saiba como se conectar.
export VITE_SERVER_URL="http://${IP_ADDRESS}:3000"

echo "Iniciando o servidor em $VITE_SERVER_URL..."

# Inicia o servidor Node.js em segundo plano (&) para que o terminal seja liberado.
node server.js &

echo "Servidor iniciado com sucesso em segundo plano."

