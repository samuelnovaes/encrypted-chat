const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connection = require('./socket');
const auth = require('./auth');

global.users = [];

const app = express();
app.use(express.static('public'));

app.get('/users', (req, res) => {
  res.json(global.users);
});

const server = createServer(app);
const io = new Server(server);

io.use(auth);
io.on('connection', connection);

server.listen(3000, () => {
  console.log('Chat rodando...');
});