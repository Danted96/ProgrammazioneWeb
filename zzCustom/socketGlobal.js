var io;
module.exports = {
    server: function (serv) {
        io = require('socket.io')(serv);
    },
    io: function () { return io; }
};