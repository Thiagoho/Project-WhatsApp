const express = require('express');
const app = express(); // ✅ Agora `app` já existe

const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');



const fs = require('fs');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const botRoutes = require('./routes/veiculoRoutes'); // Depois importa as rotas
app.use('/bot', botRoutes); // E aplica elas

const pool = require('./db/pool'); // ajuste o caminho conforme a localização do arquivo




// ROTAS - devem vir ANTES do app.listen
/*app.post('/bot/cadastrar-veiculo', async (req, res) => {
    const { placa, marca } = req.body;

    try {
        // Aqui você salva no banco (substitua pela lógica real)
        // await pool.query('INSERT INTO veiculos (placa, marca) VALUES (?, ?)', [placa, marca]);

        console.log(`🔧 Veículo cadastrado: ${placa} - ${marca}`);
        res.status(201).json({ message: 'Veículo cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar veículo:', error);
        res.status(500).json({ error: 'Erro ao cadastrar veículo' });
    }
});*/


// INICIALIZAÇÃO DO SERVIDOR - deve vir DEPOIS das rotas
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}...`);
});


// WhatsApp client setup
const client = new Client({
    authStrategy: new LocalAuth()
});

const delay = ms => new Promise(res => setTimeout(res, ms));

const userSessions = {};

const agendamentosRouter = require('./routes/agendamentos');

app.use(express.json());
app.use('/api', agendamentosRouter); // Agora essa rota vai funcionar


const { confirmarAgendamento } = require('./controllers/confirmarAgendamentoController');




// ...ConfirmarAgendamentoController
client.on('message', async (msg) => {
    const etapa = userSessions[msg.from]?.etapa;

    if (etapa === 'confirmar_agendamento') {
        // await confirmarAgendamento(msg, client, pool, userSessions); // ❌ Chamada incorreta
        return;
    }
});
// Adicionei essa comando
client.on('message', async (msg) => {
    // Agora 'msg' existe aqui!
    if (msg.body === 'confirmar') {
        // exemplo de resposta
        client.sendMessage(msg.from, '✅ Agendamento confirmado!\nHorários ocupados atualmente:\n...');
    }
});


/*client.sendMessage(msg.from, '✅ Agendamento confirmado!\n🕑 Horários ocupados atualmente:\n' + 
    horariosReservados.map(h => `• ${new Date(h).toLocaleString()}`).join('\n'));
  */
//-------------------------------------------------------------------

const marcasValidas = [
    "Chevrolet", "Citroen", "Fiat", "Ford", "Jeep", "Nissan", "Renault",
    "Toyota", "Volkswagen", "Hyundai", "Peugeot", "Audi", "Land Rover",
    "Byd", "Honda City"
];

// Gerar QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📸 Escaneie o QR Code acima para conectar.');
});

client.on('ready', () => console.log('✅ Bot conectado com sucesso!'));


// Função de timeout
const iniciarTimeout = (msg) => {
    if (userSessions[msg.from]?.timeout) clearTimeout(userSessions[msg.from].timeout);
    userSessions[msg.from].timeout = setTimeout(async () => {
        await client.sendMessage(msg.from, "⏳ Você não completou o cadastro em 3 minutos.\nSeu tempo expirou! Por favor, inicie o processo novamente.");
        delete userSessions[msg.from];
    }, 180000); // 3 min
};

// Evento principal de mensagem
client.on('message', async (msg) => {
    console.log(`📩 Mensagem recebida de ${msg.from}: ${msg.body}`);

    const isInicial = /(menu|dia|tarde|noite|oi|olá|ola)/i.test(msg.body) && msg.from.endsWith('@c.us');

    if (isInicial) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const name = contact.pushname;

        if (!userSessions[msg.from]) {
            userSessions[msg.from] = { etapa: 'inicio' };
            iniciarTimeout(msg);

            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(
                msg.from,
                `Olá! ${name?.split(" ")[0] || ''} 👋 Sou o assistente virtual da empresa Lava Jato Garagem💦.\n\n` +
                `Escolha uma das opções a seguir e envie o número:\n\n` +
                `1️⃣ Quero agendar um serviço.\n` +
                `2️⃣ Ver serviços disponíveis.\n` +
                `3️⃣ Ver redes sociais.`
            );
            return;
        }
    }

    // Etapas do fluxo
    const etapa = userSessions[msg.from]?.etapa;

    // Etapa: escolha do menu principal
    if (etapa === 'inicio') {
        if (!['1', '2', '3'].includes(msg.body)) {
            await client.sendMessage(msg.from, '❌ Opção inválida! Por favor, escolha um número entre 1 e 3.');
            return;
        }

        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();

        if (msg.body === '3') {
            await client.sendMessage(msg.from,
                `📲 Redes sociais:\n\n📷 Instagram: https://www.instagram.com/lavajatogaragem\n` +
                `📘 Facebook: https://www.facebook.com/lavajatogaragem`);
            delete userSessions[msg.from];
            return;
        }

        if (msg.body === '1') {
            await client.sendMessage(msg.from,
                `🚗 Você escolheu agendar um serviço. Escolha o tipo:\n\n` +
                `1️⃣ Lavagem Simples\n2️⃣ Lavagem Completa\n3️⃣ Polimento\n4️⃣ Higienização Interna`);
            userSessions[msg.from].etapa = 'escolha_servico';
            return;
        }
    }

    // Etapa: escolha do serviço
    if (etapa === 'escolha_servico') {
        const servicos = {
            '1': 'Lavagem Simples',
            '2': 'Lavagem Completa',
            '3': 'Polimento',
            '4': 'Higienização Interna'
        };
        if (!servicos[msg.body]) {
            await client.sendMessage(msg.from, '❌ Opção inválida. Escolha 1, 2, 3 ou 4.');
            return;
        }

        iniciarTimeout(msg);
        userSessions[msg.from].servicoEscolhido = servicos[msg.body];
        userSessions[msg.from].etapa = 'placa';

        await client.sendMessage(msg.from, `✅ Serviço escolhido: ${servicos[msg.body]}\n➡️ Informe a placa (ABC1D23 ou ABC-1234):`);
        return;
    }

    // Etapa: cadastro da placa
    if (etapa === 'placa') {
        const placaRegex = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/i;
        if (!placaRegex.test(msg.body)) {
            await client.sendMessage(msg.from, '❌ Placa inválida! Use o formato correto.');
            return;
        }

        iniciarTimeout(msg);
        userSessions[msg.from].placa = msg.body.toUpperCase();
        userSessions[msg.from].etapa = 'marca';

        await client.sendMessage(msg.from, `✅ Placa registrada: ${msg.body.toUpperCase()}\n➡️ Informe a marca do veículo:`);
        return;
    }

    // Etapa: cadastro da marca

    if (etapa === 'marca') {
        const marca = msg.body.trim();
        if (!marcasValidas.includes(marca)) {
            await client.sendMessage(msg.from, `❌ Marca inválida. Escolha uma dessas:\n${marcasValidas.join(', ')}`);
            return;
        }

        userSessions[msg.from].marca = marca;
        const { placa } = userSessions[msg.from];

        axios.post('http://localhost:3000/bot/cadastrar-veiculo', { placa, marca })
            .then(async (response) => {
                if (response.status === 200 || response.status === 201) {
                    const veiculoCriado = response.data; // <- Aqui você pega o dado retornado pelo backend

                    // ✅ Atualiza a sessão do usuário com o ID e a placa retornados
                    userSessions[msg.from] = {
                        ...userSessions[msg.from],
                        idVeiculo: veiculoCriado.id,
                        placa: veiculoCriado.placa
                    };

                    await client.sendMessage(msg.from,
                        `✅ Cadastro concluído!\n\n🔹 Placa: ${placa}\n🔹 Marca: ${marca}`);

                    await client.sendMessage(msg.from,
                        `📅 Gostaria de agendar seu serviço agora?\nDigite *sim* para ver os horários disponíveis.`);

                    userSessions[msg.from].etapa = 'confirmar_agendamento';
                } else {
                    await client.sendMessage(msg.from, `❌ Erro ao cadastrar veículo. Código: ${response.status}`);
                }
            })
            .catch(async (error) => {
                console.error("Erro ao salvar veículo:", error);
                await client.sendMessage(msg.from, `❌ Erro ao cadastrar veículo. Tente novamente mais tarde.`);
            });

        return;
    }

    /*  if (etapa === 'confirmar_agendamento') {
          const resposta = msg.body.trim().toLowerCase();
  
          if (resposta === 'sim') {
              const placa = userSessions[msg.from]?.placa;
  
              if (!placa) {
                  await client.sendMessage(msg.from, '❌ Não foi possível identificar o veículo. Por favor, cadastre o veículo novamente.');
                  return;
              }
  
              try {
                  const response = await axios.get(`http://localhost:3000/api/veiculos/placa/${userSessions[msg.from].placa}`)
  
                  const veiculo = response.data;
  
                  // Continua com a lógica de agendamento usando o veículo retornado...
              } catch (error) {
                  console.error("Erro ao agendar:", error);
                  await client.sendMessage(msg.from, '❌ Erro ao buscar o veículo para agendamento.');
              }
          }
      }*/





    if (etapa === 'confirmar_agendamento' && msg.body.toLowerCase() === 'sim') {
        // Aqui você precisará coletar a data e hora desejada pelo usuário
        // Para simplificar, vamos supor que você já tem essas informações (idVeiculo e dataHora)
        const placa = userSessions[msg.from].placa;

        try {
            // const { data: veiculo } = await axios.get(`http://localhost:3000/api/veiculos/placa/${placa}`);

            const { data: veiculo } = await axios.post(`http://localhost:3000/api/veiculos/placa/${userSessions[msg.from].placa}`);

            //  const response = await axios.get(`http://localhost:3000/api/veiculos/placa/${userSessions[msg.from].placa}`)

            const idVeiculo = veiculo.id;

            const dataHora = '2025-04-11 10:00:00'; // ou pegue do usuário
            const response = await axios.post('http://localhost:3000/api/agendamentos', { idVeiculo, dataHora });

            await client.sendMessage(msg.from, response.data.message);
            delete userSessions[msg.from];
        } catch (error) {
            console.error('Erro ao agendar:', error.response ? error.response.data : error.message);
            await client.sendMessage(msg.from, '❌ Ocorreu um erro ao tentar agendar.');
        }

        return;
    }


    // Consulta de serviços disponíveis
    if (msg.body === '2') {
        try {
            const [rows] = await pool.query("SELECT horario FROM horarios_disponiveis WHERE disponivel = 1 ORDER BY horario ASC");

            if (!Array.isArray(rows) || rows.length === 0) {
                await client.sendMessage(msg.from, `⚠️ Nenhum horário disponível no momento.`);
                return;
            }

            const horarios = rows.map(row => `🕒 ${row.horario}`).join("\n");
            await client.sendMessage(msg.from, `⏳ Horários disponíveis:\n\n${horarios}`);
        } catch (err) {
            console.error("Erro ao buscar horários:", err);
            await client.sendMessage(msg.from, `❌ Erro ao buscar horários. Tente mais tarde.`);
        }
    }



});

// Inicializa o WhatsApp
client.initialize();
