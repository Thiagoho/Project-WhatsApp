Vou explicar de forma clara como tudo isso funciona e como o seu bot vai operar
no seu servidor.
'O bot foi desenvolvido usando o whatsapp-web.js, uma biblioteca que permite automatizar
interações no WhatsAppWeb. Ele age como um assistenten virtual, respondendo mensagens e guiando 
os usuário pelo processo de cadastro no Lava jato.'

=> Como ele vai se conectar ao WhatsApp:
º Sempre que você iniciar o bot, ele gerar um Qr Code.
º Você precisar escanear o QR Code com o número do WhatsApp que será usado como atendente
virtual. O bot vai permanecer ativo e responder os clientes automaticamente.

AGORA VAMOS INSTALL AS DEPENDÊNCIAS NECESSÁRIAS
### npm install whatsapp-web.js qrcode-terminal fs
|> Aqui, fs (File System) será usado para salvar e carregar a sessão.

INICIAR O BOT AUTOMATICAMENTE QUANDO O SERVIDOR LIGAR:
|> Vá no terminal do VScode da os seguinte comando:
### @echo off
### cd C:\caminho\do\seu\bot
### node index.js ou nodemon bot.js



COMO RODAR O PROJETO BAIXA
Instalar todas as dependências pele package.json
### nmp install

SEQUÊNCIA PARA CRIAR O PROJETO
Criar o arquivo package
### npm init

Gerência as requisições, rotas e URLS, entre outra funcionalidaes
### npm install express

Rodar o projeto 
### node bot.js

Rodar o projeto no navegador 
### http://localhost:3000

Instalar o módulo para reiniciar o servidor sempre que houver alteração no código
fonte, g significa globalmente
### npm install -g nodemon 
### npm install --save-dev nodemon

Rodar o projeto com nodemon
### nodemon bot.js

Sequelize é um biblioteca JavaScript que facilita o gerenciamento de uma banco de 
dados SQL
### npm install --save sequelize

Instalar o Drive do Bando de Dados -> MYSQL
### npm install --save mysql2
