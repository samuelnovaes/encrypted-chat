/**
 * @param {import('socket.io').Socket} socket 
 */
module.exports = (socket, next) => {
  const { nick, publicKey } = socket.handshake.query;
  if (!nick) {
    next(new Error('Por favor, preencha seu nome'));
    return;
  }
  if (global.users.some((user) => user.nick === nick)) {
    next(new Error('Nome de usuário indisponível, por favor, tente outro nome'));
    return;
  }
  const user = {
    id: socket.id,
    nick,
    publicKey
  };
  global.users.push(user);
  next();
};