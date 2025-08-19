const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// Conexão com SQLite
const db = new sqlite3.Database('./backend/demandas.db', err => {
  if(err) console.error(err.message);
  else console.log('Conectado ao SQLite');
});

// Criar tabela de demandas
db.run(`CREATE TABLE IF NOT EXISTS demandas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT,
  responsavel TEXT,
  unidade TEXT,
  chamado TEXT,
  solicitante TEXT,
  local TEXT,
  defeito TEXT,
  acao TEXT
)`);

// Salvar demanda
app.post('/salvar-demanda', (req, res) => {
  const d = req.body;
  db.run(`INSERT INTO demandas (data,responsavel,unidade,chamado,solicitante,local,defeito,acao)
          VALUES (?,?,?,?,?,?,?,?)`,
          [d.data,d.responsavel,d.unidade,d.chamado,d.solicitante,d.local,d.defeito,d.acao],
          function(err){
    if(err) return res.status(500).send(err.message);
    res.send({message: 'Demanda salva!', id: this.lastID});
  });
});

// Listar demandas por data
app.get('/demandas/:data', (req,res) => {
  db.all('SELECT * FROM demandas WHERE data = ?', [req.params.data], (err, rows)=>{
    if(err) return res.status(500).send(err.message);
    res.send(rows);
  });
});


// Salvar demanda
app.post('/salvar-demanda', (req, res) => {
  const d = req.body;
  db.run(`INSERT INTO demandas (data,responsavel,unidade,chamado,solicitante,local,defeito,acao)
          VALUES (?,?,?,?,?,?,?,?)`,
          [d.data,d.responsavel,'','','','', '', d.texto],
          function(err){
    if(err) return res.status(500).send(err.message);
    res.send({message: 'Demanda salva!', id: this.lastID});
  });
});



app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
