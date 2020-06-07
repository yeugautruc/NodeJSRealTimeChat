const fetch = require('node-fetch');
const path = require('path');
const express = require('express');
const app = express();
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let user = {};
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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
            socket.emit('user-list-emit', user);
            socket.broadcast.emit('user-list-emit', user);
        }
    })
    socket.on('send-msg', msg => {
        if (msg.includes("corona")) {
            fetch('http://141.41.235.21:1880/corona_regions/')
                .then(response => response.json())
                .then(data => {
                    msg = msg.replace("corona ", "");
                    msg = msg.toLowerCase();
                    msg = msg[0].toUpperCase() + msg.slice(1);
                    socket.broadcast.emit('ask-msg-corona', { message: msg, name: user[socket.id] });
                    socket.broadcast.emit('info-corona', data.data[msg]);
                    socket.emit('info-corona', data.data[msg]);
                })
                .catch(err => { })
        } else if (msg.includes("map")) {
            let location = msg;
            let url = 'https://maps.googleapis.com/maps/api/geocode/json?&key=AIzaSyC_0nX6TjfZ03keMMM3_wTDZZ3QenuX2cc&address=' + location;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    msg = msg.replace("map ", "");
                    msg = msg.toLowerCase();
                    msg = msg[0].toUpperCase() + msg.slice(1);
                    socket.broadcast.emit('ask-msg-map', { message: msg, name: user[socket.id] });
                    socket.broadcast.emit('info-map', data.results[0].geometry.location);
                    socket.emit('info-map', data.results[0].geometry.location);
                })
                .catch(err => { })
        }
        else {
            socket.broadcast.emit('chat-msg', { message: msg, name: user[socket.id] });
        }
    })
    socket.on('disconnect', () => {
        console.log(user[socket.id] + " disconnected");
        socket.broadcast.emit('user-disconnect', user[socket.id]);
        delete user[socket.id];
        socket.broadcast.emit('user-list-emit', user);
    })
});

server.listen(8080, () => {
    console.log("listen to port 8080");
});
