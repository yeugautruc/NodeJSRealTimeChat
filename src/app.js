const fetch = require('node-fetch');
const path = require('path');
const express = require('express');
const app = express();
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
app.set('view engine', 'hbs')
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let user = {};
app.get('/', (req, res) => {
    res.render("index.hbs", () => {
    });
});

io.on('connection', (socket) => {
    console.log(socket.id + " connected")
    socket.on('new-user', name => {
        let userExist = (JSON.stringify(user).includes(name));
        if (userExist) {
            socket.emit('user-exist', name);
        }
        else {
            user[socket.id] = name;
            socket.broadcast.emit('user-connect', name);
        }
    })
    socket.on('send-msg', msg => {
        if (msg.includes("corona")) {
            fetch('http://141.41.235.21:1880/corona_regions/')
                .then(response => response.json())
                .then(data => {
                    msg = msg.replace("corona ", "");
                    console.log(msg);
                    socket.broadcast.emit('ask-msg', { message: msg, name: user[socket.id] });
                    socket.broadcast.emit('info-corona', data.data[msg]);
                    socket.emit('info-corona', data.data[msg]);
                })
                .catch(err => { })
        }
        else {
            socket.broadcast.emit('chat-msg', { message: msg, name: user[socket.id] });
        }
    })
    socket.on('send-map', data => {
        console.log(data);
        socket.broadcast.emit('broadcast-map', data);
    });
});

server.listen(8080);
