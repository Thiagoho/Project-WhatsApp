const express = require('express');
const router = express.Router();
const { confirmarAgendamento } = require('../controllers/confirmarAgendamentoController');

router.post('/agendamentos', confirmarAgendamento);

module.exports = router;

