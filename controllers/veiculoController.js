const pool = require('../db/pool');
const { sendWhatsappMessage } = require('../services/whatsappService');

// controllers/cadastrarVeiculoController.js



exports.cadastrarVeiculo = (req, res) => {
    const { placa, marca, horario, numero } = req.body;

    if (!placa || !marca) {
        return res.status(400).json({ error: 'Placa e Marca são obrigatórios' });
    }

    pool.query(
        'INSERT INTO veiculos (placa, marca, horario) VALUES (?, ?, ?)',
        [placa, marca, horario || new Date()],
        async (error, result) => {
            if (error) {
                console.error('Erro ao cadastrar veículo:', error);
                return res.status(500).send('Erro ao cadastrar veículo!');
            }

            console.log(`🔧 Veículo cadastrado: ${placa} - ${marca}`);

            if (numero) {
                await sendWhatsappMessage(numero, `🚗 Veículo cadastrado com sucesso!\nPlaca: ${placa}\nMarca: ${marca}`);
            }

            res.status(201).json({ message: 'Veículo cadastrado com sucesso!', id: result.insertId });
        }
    );
};







