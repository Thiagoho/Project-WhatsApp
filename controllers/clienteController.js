const mysql = require('mysql');

// Conexão com banco (use pool ou outro arquivo se tiver separado)
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rob_teste'
});

exports.getAllClientes = (req, res) => {
    pool.query('SELECT * FROM clientes', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar clientes');
        }
        res.json(rows);
    });
};

exports.getClienteById = (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM clientes WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar cliente');
        }
        res.json(rows);
    });
};

exports.deleteCliente = (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM clientes WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao excluir cliente');
        }
        res.send(`✅ Cliente com ID ${id} excluído com sucesso.`);
    });
};

exports.updateCliente = (req, res) => {
    const id = req.params.id;
    const { nome, placa, marca } = req.body;
    pool.query(
        'UPDATE clientes SET nome = ?, placa = ?, marca = ? WHERE id = ?',
        [nome, placa, marca, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao atualizar cliente');
            }
            res.send(`✅ Cliente atualizado com sucesso: ${nome}`);
        }
    );
};
// clienteController.js
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Agora sim você pode exportar
module.exports = client;





