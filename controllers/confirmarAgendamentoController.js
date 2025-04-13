// controllers/confirmarAgendamentoController.js

const pool = require('../db/pool');
// controllers/confirmarAgendamentoController.js



exports.confirmarAgendamento = async (req, res) => {
  try {
    const { placa, marca, data, horario } = req.body;

    if (!placa || !marca || !data || !horario) {
      return res.status(400).json({ message: '❌ Dados incompletos.' });
    }

    const dataHora = `${data} ${horario}`;

    const [horariosOcupados] = await pool.promise().query(
      'SELECT * FROM agendamentos WHERE dataHora = ?',
      [dataHora]
    );

    if (horariosOcupados.length > 0) {
      return res.status(400).json({ message: '❌ Horário já ocupado. Escolha outro horário.' });
    }

    const [veiculoExistente] = await pool.promise().query(
      'SELECT id FROM veiculos WHERE placa = ?',
      [placa]
    );

    let idVeiculo;

    if (veiculoExistente.length > 0) {
      idVeiculo = veiculoExistente[0].id;
    } else {
      const [insertVeiculoResult] = await pool.promise().query(
        'INSERT INTO veiculos (placa, marca) VALUES (?, ?)',
        [placa, marca]
      );
      idVeiculo = insertVeiculoResult.insertId;
    }

    const [insertAgendamento] = await pool.promise().query(
      'INSERT INTO agendamentos (idVeiculo, dataHora) VALUES (?, ?)',
      [idVeiculo, dataHora]
    );

    const [agendados] = await pool.promise().query(
      'SELECT dataHora FROM agendamentos ORDER BY dataHora'
    );

    res.status(201).json({
      message: '✅ Agendamento confirmado!',
      agendamentoId: insertAgendamento.insertId,
      horariosReservados: agendados.map(a => a.dataHora)
    });

  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error.message || error);
    res.status(500).json({ message: 'Erro ao confirmar agendamento.' });
  }
};

/*const confirmarAgendamento = (req, res) => {
  const { idVeiculo, dataHora } = req.body;

  if (!idVeiculo || !dataHora) {
    return res.status(400).json({ message: '❌ Dados incompletos.' });
  }

  // Verificar se o horário já está ocupado
  pool.query('SELECT * FROM agendamentos WHERE dataHora = ?', [dataHora], (err, rows) => {
    if (err) {
      console.error('Erro na verificação de horário:', err);
      return res.status(500).json({ message: 'Erro ao verificar o horário.' });
    }

    if (rows.length > 0) {
      return res.status(400).json({ message: '❌ Horário já ocupado. Escolha outro horário.' });
    }

    // Inserir novo agendamento
    pool.query('INSERT INTO agendamentos SET ?', { idVeiculo, dataHora }, (err, result) => {
      if (err) {
        console.error('Erro ao inserir agendamento:', err);
        return res.status(500).json({ message: 'Erro ao salvar o agendamento.' });
      }

      // Buscar todos os horários agendados
      pool.query('SELECT dataHora FROM agendamentos ORDER BY dataHora', (err, agendados) => {
        if (err) {
          console.error('Erro ao buscar agendamentos:', err);
          return res.status(500).json({ message: 'Erro ao buscar agendamentos.' });
        }

        res.status(201).json({
          message: '✅ Agendamento confirmado!',
          agendamentoId: result.insertId,
          horariosReservados: agendados.map(a => a.dataHora)
        });
      });
    });
  });
};

module.exports = { confirmarAgendamento };



/*const confirmarAgendamento = async (msg, client, pool, userSessions) => {
    const resposta = msg.body.toLowerCase();
    const session = userSessions[msg.from];
    const idVeiculo = session?.veiculoId;

    if (!idVeiculo) {
        await client.sendMessage(msg.from, `❌ Não foi possível encontrar o veículo para este agendamento. Por favor, comece novamente digitando *menu*.`);
        delete userSessions[msg.from];
        return;
    }

    // Inserção da confirmação do agendamento
    const [resultInsert] = await pool.query(
        "INSERT INTO confirmar_agendamento (id_veiculo, resposta) VALUES (?, ?)",
        [idVeiculo, resposta]
    );

    if (resultInsert && resultInsert.insertId) {
        userSessions[msg.from] = {
            ...session,
            confirmacaoId: resultInsert.insertId
        };
    } else {
        await client.sendMessage(msg.from, `❌ Erro ao salvar a confirmação. Tente novamente mais tarde.`);
        delete userSessions[msg.from];
        return;
    }

    // Caso o usuário tenha respondido "sim"
    if (resposta === 'sim') {
        const [rows] = await pool.query("SELECT horario FROM horarios_disponiveis WHERE disponivel = 1 ORDER BY horario ASC");

        if (Array.isArray(rows) && rows.length > 0) {
            const horarios = rows.map(row => `🕒 ${row.horario}`).join("\n");
            await client.sendMessage(msg.from, `⏳ Horários disponíveis:\n\n${horarios}`);
        } else {
            await client.sendMessage(msg.from, `⚠️ Nenhum horário disponível no momento.`);
        }
    } else {
        await client.sendMessage(msg.from, `Ok! Se quiser agendar depois, basta enviar *menu* para voltar ao início.`);
    }

    delete userSessions[msg.from];
};

module.exports = { confirmarAgendamento };*/
