const path = require('path');
const express = require('express');
const app = express();
const publicPath = path.join(__dirname,'../public');
app.use(express.static(publicPath));
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', (socket) => {
socket.on('send-msg',msg=>{
    socket.broadcast.emit('chat-msg',msg);
})
});

server.listen(3000);
