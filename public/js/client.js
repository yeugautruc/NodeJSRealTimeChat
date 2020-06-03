
const socket = io.connect('localhost:8080');
const msgContainer = document.getElementById('msg-container');
const msgForm = document.getElementById('chatbox-form');
const msgInput = document.getElementById('msgInput');
const helloID = document.getElementById('hello-id');
let name = prompt("enter your name");
name = name.toUpperCase();
displayMsgClient("You joined");
window.scrollTo(0, document.body.scrollHeight);
socket.emit('new-user', name);
helloID.innerHTML = "Hello " + name;
socket.on('user-exist', name => {
    const newname = prompt("name has already existed, choose new one:");
    socket.emit('new-user', newname);
    helloID.innerHTML = "Hello " + newname;
})
socket.on('ask-msg-corona', (data) => {
    displayMsgServer(data.name + " asked about corona statisic of " + data.message + "!","#ffcdb2");
    window.scrollTo(0, document.body.scrollHeight);
});
socket.on('ask-msg-map', (data) => {
    displayMsgServer(data.name + " asked to show map of " + data.message + "!","#ffcdb2");
    window.scrollTo(0, document.body.scrollHeight);
});
socket.on('info-map', data => {
    displayMap();
    initialize(data.lat, data.lng);
    window.scrollTo(0, document.body.scrollHeight);
})
socket.on('info-corona', (data) => {
    if (data === null) {
        displayMsgServer("We don't have information about this city");
        window.scrollTo(0, document.body.scrollHeight);
    } else {
        displayCorona(data, "#fdffb6");
        window.scrollTo(0, document.body.scrollHeight);
    }
});
socket.on('chat-msg', data => {
    displayMsgServer(data.name + " said: " + data.message, "#ffcdb2");
    window.scrollTo(0, document.body.scrollHeight);
})
socket.on('user-connect', name => {
    displayMsgServer(name + " is connected","#e5989b");
    window.scrollTo(0, document.body.scrollHeight);
})

msgForm.addEventListener('submit', e => {
    e.preventDefault();
    let msg = msgInput.value;
    if (msg.includes("corona")) {
        outmsg = msg.replace("corona ", "");
        displayMsgClient("You asked about corona statisic of " + outmsg);
        window.scrollTo(0, document.body.scrollHeight);
    }
    else if (msg.includes("show")) {
        outmsg = msg.replace("show ", "");
        displayMsgClient("You asked to show " + outmsg);
        window.scrollTo(0, document.body.scrollHeight);
    }
    else {
        displayMsgClient("You said: " + msg);
        window.scrollTo(0, document.body.scrollHeight);
    }
    socket.emit('send-msg', msg);
    msgInput.value = '';
});
function displayMsgClient(msg) {
    const msgElement = document.createElement('div');
    msgElement.setAttribute("style", "background-color: #f0fbfa;margin-top: 1px;border: 0.5px solid red;width: fit-content;padding: 5px;margin-left: 5px;");
    msgElement.innerText = msg;
    msgContainer.append(msgElement);
}
function displayMsgServer(msg, color) {
    const msgElement = document.createElement('div');
    msgElement.setAttribute("style", "background-color:" + color + "; margin-left:auto; margin-right:5px;border: 0.5px solid red;width: fit-content;padding: 5px;");
    msgElement.innerText = msg;
    msgContainer.append(msgElement);
}
function displayMap() {
    const mapElement = document.createElement('div');
    mapElement.setAttribute("class", "map");
    mapElement.setAttribute("style", "background-color: orange; margin-left:auto; margin-right:5px;border: 1px solid brown; width: 500px;height:300px;");
    msgContainer.append(mapElement);
}
function clearChat() {
    while (msgContainer.hasChildNodes()) {
        msgContainer.removeChild(msgContainer.firstChild);
    }
}
function initialize(lat, lng) {
    var map;
    var mapOptions = {
        zoom: 8,
        center: { lat: lat, lng: lng }
    };
    var elements = document.getElementsByClassName('map');
    console.log(elements);
    for (var i = elements.length - 1; i < elements.length; i++) {
        map = new google.maps.Map(elements[i],
            mapOptions);
    }

};
function displayCorona(data, color) {
    displayMsgServer("Base on information of Corona REST API:", color);
    displayMsgServer("Name: " + data.name, color);
    displayMsgServer("Bundesland: " + data.bl, color);
    displayMsgServer("Cases: " + data.cases, color);
    displayMsgServer("Deaths: " + data.deaths, color);
    displayMsgServer("Death rate: " + Math.round(data.death_rate * 100) / 100 + "%", color);
    displayMsgServer("Last update: " + data.last_update, color);
}
