const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');

router.post('/clientes', clienteController.getAllClientes);
//router.post('/clientes', clienteController.createCliente);
router.get('/clientes/:id', clienteController.getClienteById);
router.delete('/clientes/:id', clienteController.deleteCliente);
router.put('/clientes/:id', clienteController.updateCliente);

module.exports = router;
