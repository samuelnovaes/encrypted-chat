/**
 * @param {import('socket.io').Socket} socket 
 */
module.exports = (socket) => {
  socket.broadcast.emit('get-users', global.users);

  socket.on('message', ({ to, message }) => {
    socket.to(to).emit('message', { from: socket.id, message });
  });

  socket.on('disconnect', () => {
    global.users = global.users.filter((user) => user.id != socket.id);
    socket.broadcast.emit('get-users', global.users);
  });
};