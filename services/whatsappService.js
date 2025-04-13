// Importando o cliente do WhatsApp
const { client } = require('../bot');

const sendWhatsappMessage = async (numero, mensagem) => {
    try {
        await client.sendMessage(numero, mensagem);
    } catch (error) {
        console.error("Erro ao enviar mensagem WhatsApp:", error);
    }
};

module.exports = { sendWhatsappMessage };