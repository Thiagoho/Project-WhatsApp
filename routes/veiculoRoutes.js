// routes/veiculoRoutes.js
const express = require('express');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');

router.post('/cadastrar-veiculo', veiculoController.cadastrarVeiculo);

module.exports = router;
