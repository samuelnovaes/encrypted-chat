/**
 * @param {import('socket.io').Socket} socket 
 */
module.exports = (socket) => {
  const nick = socket.handshake.query.nick;
  socket.broadcast.emit('get-users', global.users);

  socket.on('message', ({ to, message }) => {
    socket.to(to).emit('message', { from: socket.id, message });
  });

  socket.on('disconnect', () => {
    global.users = global.users.filter((user) => user.nick != nick);
    socket.broadcast.emit('get-users', global.users);
  });
};