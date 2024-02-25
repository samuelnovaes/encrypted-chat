import { genKeys, encrypt, decrypt } from './lib.mjs';

const nickForm = document.getElementById('nickform');
const container = document.getElementById('container');
const usersList = document.getElementById('users');
const main = document.getElementById('main');
const header = document.getElementById('header');
const inputForm = document.getElementById('inputform');
const messageArea = document.getElementById('messagearea');

let socket;
let id;
let userSelected;
let nick;
let keys;
let messages = [];

const setRead = (userId, read) => {
  const element = document.getElementById(userId);
  if (element) {
    element.style.color = read ? 'black' : 'red';
  }
};

const updateUsers = async (items) => {
  const users = items.filter((user) => user.id !== id);
  messages = messages.filter((message) => users.some((user) => user.id === message.from || user.is === message.to));
  if(!users.some((user) => user.id === userSelected?.id)) {
    main.style.display = 'none';
    userSelected = null;
  }
  usersList.innerHTML = '';
  for (const user of users) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.innerText = user.nick;
    a.id = user.id;
    li.appendChild(a);
    usersList.appendChild(li);
    a.addEventListener('click', () => {
      userSelected = user;
      header.innerText = user.nick;
      main.style.display = 'flex';
      setRead(user.id, true);
      updateMessages(user.id);
    });
  }
};

const updateMessages = (userId) => {
  if (userId === userSelected?.id) {
    const userSelectedMessages = messages.filter((message) => message.to === userId || message.from === userId);
    messageArea.innerHTML = '';
    for (const message of userSelectedMessages) {
      const p = document.createElement('p');
      p.classList.add('message');
      const username = document.createElement('strong');
      username.innerText = `${message.from === userId ? userSelected.nick : nick}:`;
      username.style.color = message.from === userId ? 'red' : 'blue';
      p.appendChild(username);
      const text = document.createElement('span');
      text.innerText = message.message;
      p.appendChild(text);
      messageArea.appendChild(p);
    }
  }
  else {
    setRead(userId, false);
  }
};

const onConnectError = (err) => {
  alert(err.message);
};

const onConnect = async () => {
  id = socket.id;
  const response = await fetch('/users');
  const users = await response.json();
  await updateUsers(users);
  container.style.display = 'flex';
  nickForm.style.display = 'none';
};

const onGetUsers = (users) => {
  updateUsers(users);
};

const onDisconnect = () => {
  container.style.display = 'none';
  nickForm.style.display = 'flex';
};

const onMessage = async ({ from, message }) => {
  const decryptedMessage = await decrypt(keys.privateKey, message);
  messages.push({
    from,
    to: id,
    message: decryptedMessage
  });
  updateMessages(from);
};

const sendMessage = async (e) => {
  e.preventDefault();
  const input = e.target.message;
  const encryptedMessage = await encrypt(userSelected.publicKey, input.value);
  socket.emit('message', { to: userSelected.id, message: encryptedMessage });
  messages.push({
    from: id,
    to: userSelected.id,
    message: input.value
  });
  input.value = '';
  updateMessages(userSelected.id);
};

const entrar = async (e) => {
  e.preventDefault();
  nick = e.target.nick.value;
  keys = await genKeys();
  socket = io({
    query: {
      nick,
      publicKey: keys.publicKey
    }
  });
  socket.on('connect_error', onConnectError);
  socket.on('connect', onConnect);
  socket.on('get-users', onGetUsers);
  socket.on('disconnect', onDisconnect);
  socket.on('message', onMessage);
};

nickForm.addEventListener('submit', entrar);
inputForm.addEventListener('submit', sendMessage);