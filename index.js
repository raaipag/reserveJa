//iniciando a aplicação
const express = require("express");
const mysql = require("mysql2");
const app = express();
app.use(express.json());

//definindo a porta
const porta = 1000;
app.listen(porta, () => console.log('executando. Porta', porta));

//criando conexão
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'ReserveJa',
    password: ''
})

//micros serviços
//Seção de micros serviços de clientes

//consulta de clientes
app.get("/clientes", (req, res) => {
    connection.query('SELECT * FROM clientes WHERE ativo = 1', (err, results) => {
        res.json(results)
        console.log(results)
    })
})

//consulta de clientes por cpf
app.post("/clientes/consultar", (req, res) => {
    connection.query('SELECT * FROM clientes WHERE cpf =' + req.body.cpf, (err, results) => {
        res.json(results)
        console.log(results)
    })
})

//criação de clientes
app.post("/clientes/criar", (req, res) => {
    connection.query('INSERT INTO clientes VALUES (id, \'' + req.body.nome + '\', \'' + req.body.cpf + '\', \'' + req.body.telefone + '\', 1)', (err, results) => {
        res.json({ status: 200, message: "Cliente criado com sucesso", data: results })
    })
});

//desativar cliente
app.put("/clientes/:id", (req, res) => {
    connection.query('UPDATE clientes SET ativo = 0 WHERE id = ' + req.params.id, (err, results) => {
        res.json({ status: 200, message: "Cliente inativado" })
    })
});


//Seção de micros serviços de horarios
// consultar agenda
app.post("/agenda/consult/:id", (req, res) => {
    connection.query('SELECT * FROM agenda WHERE id =\'' + req.params.id + '\'', (err, results) => {
        res.json({ status: 200, message: "Agenda Criada" })
    })
})

app.post("/agenda/consultar", (req, res) => {
    connection.query('SELECT * FROM agenda WHERE data =\'' + req.body.data + '\' order by hora', (err, results) => {
        res.json(results)
    })
})

// criar disponibilidade
app.post("/agenda/criar", (req, res) => {
    connection.query('INSERT INTO agenda VALUES (id, \'' + req.body.data + '\', \'' + req.body.hora + '\',' + req.body.disponibilidade + ', 1)', (err, results) => {
        res.json({ status: 200, message: "Agenda Criada" })
    })
})

// inativar agenda
app.put("/agenda/inativar", (req, res) => {
    connection.query('UPDATE agenda SET ativo = 0 WHERE data = \'' + req.body.data + '\'', (err, results) => {
        res.json({ status: 200, message: "Agenda inativa" })
    })
});



//Seção de micros serviços de reserva
// consulta reserva por cpf
app.post("/reserva/consultar", (req, res) => {
    connection.query('SELECT * FROM reservas INNER JOIN clientes c on reservas.idCliente = c.id INNER JOIN agenda a on reservas.idAgenda = a.id where c.cpf =\'' + req.body.cpf + '\'', (err, results) => {
        res.json(results)
        console.log(results)
    })
})

// cria reserva
app.post("/reserva/criar", (req, res) => {
    connection.query('SELECT * FROM agenda WHERE id =' + req.body.idAgenda, (err, results) => {
        const resultArrumado = Object.assign({}, ...results);
        if (resultArrumado.id) {
            const disponibilidade = resultArrumado.disponibilidade - 1;
            connection.query('UPDATE agenda SET disponibilidade = ' + disponibilidade + ' ' + 'WHERE id = ' + resultArrumado.id, (err, results) => {
                if (!err) {
                    connection.query('INSERT INTO reservas VALUES(id, ' + req.body.idCliente + ', ' + req.body.idAgenda + ',1) ', (err, result) => {
                        return res.json({ status: 200, message: "Reserva Efetuada" })
                    }
                    )
                }
            })
        } else {
            return res.json("---Estamos com problemas para efetuar sua reserva!---")
        }
    })
})

