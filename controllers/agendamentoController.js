// controllers/agendamentoController.js

async function agendarHorario(req, res) {
    const { nome, horario } = req.body;
    console.log(`📆 Novo agendamento: ${nome} às ${horario}`);
    res.status(201).json({ message: 'Agendamento realizado com sucesso!' });
}

module.exports = { agendarHorario };
