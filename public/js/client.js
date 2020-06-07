
const socket = io.connect('https://yeugautruc-11e6bb5b.localhost.run');
const msgContainer = document.getElementById('msg-container');
const msgForm = document.getElementById('chatbox-form');
const msgInput = document.getElementById('msgInput');
const helloID = document.getElementById('hello-id');
let date = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
let name = prompt("enter your name");
while (name == null || name == "") {
    name = prompt("enter your name");
}
name = name.toUpperCase();
displayMsgClient("You joined");
msgContainer.scrollTo(0, msgContainer.scrollHeight);
socket.emit('new-user', name);
helloID.innerHTML = "Hello " + name;

/*
handle emit from server
*/

socket.on('user-exist', name => {
    const newname = prompt("name has already existed, choose new one:");
    socket.emit('new-user', newname);
    helloID.innerHTML = "Hello " + newname;
})
socket.on('ask-msg-corona', (data) => {
    displayMsgServer(data.name + " asked about corona statisic of " + data.message + "!", "#ffcdb2");
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
});
socket.on('ask-msg-map', (data) => {
    displayMsgServer(data.name + " asked to show map of " + data.message + "!", "#ffcdb2");
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
});
socket.on('info-map', data => {
    displayMap();
    initialize(data.lat, data.lng);
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
})
socket.on('info-corona', (data) => {
    if (data === null) {
        displayMsgServer("We don't have information about this city");
        msgContainer.scrollTo(0, msgContainer.scrollHeight);
    } else {
        displayCorona(data, "#fdffb6");
        msgContainer.scrollTo(0, msgContainer.scrollHeight);
    }
});
socket.on('chat-msg', data => {
    displayMsgServer(data.name + " said: " + data.message, "#ffcdb2");
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
})
socket.on('user-connect', name => {
    displayMsgServer(name + " is connected", "#a1bff0");
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
})
socket.on('user-disconnect', name => {
    displayMsgServer(name + " is disconnected", "#e5989b");
    msgContainer.scrollTo(0, msgContainer.scrollHeight);
})
socket.on('user-list-emit', user => {
    displayUserList(user);
})

/*
submit msg
*/

msgForm.addEventListener('submit', e => {
    e.preventDefault();
    let msg = msgInput.value;
    if (msg.includes("corona")) {
        outmsg = msg.replace("corona ", "");
        displayMsgClient("You asked about corona statisic of " + outmsg);
        msgContainer.scrollTo(0, msgContainer.scrollHeight);
    }
    else if (msg.includes("show")) {
        outmsg = msg.replace("show ", "");
        displayMsgClient("You asked to show " + outmsg);
        msgContainer.scrollTo(0, msgContainer.scrollHeight);
    }
    else {
        displayMsgClient("You said: " + msg);
        msgContainer.scrollTo(0, msgContainer.scrollHeight);
    }
    socket.emit('send-msg', msg);
    msgInput.value = '';
});

/*
functions
*/

function displayMsgClient(msg) {
    const msgElement = document.createElement('div');
    msgElement.setAttribute("style", "background-color: #f0fbfa;margin: 5px auto 5px 5px;border: 2px solid #dedede; min-width: 30vw; max-width: 60vw; width: fit-content;padding: 1px;");
    const text = document.createElement('p');
    text.innerText = msg;
    const time = document.createElement('span');
    time.setAttribute('style', 'float: right; opacity:0.5;')
    time.innerText = date.getHours() + ":" + date.getMinutes() + ", " + ("0" + date.getDate()).slice(-2) + "/" + monthNames[date.getMonth()];

    msgElement.appendChild(time);
    msgElement.appendChild(text);
    msgContainer.appendChild(msgElement);
}
function displayMsgServer(msg, color) {
    const msgElement = document.createElement('div');
    msgElement.setAttribute("style", "background-color:" + color + "; margin: 5px 5px 5px auto ;border: 0.5px solid red;min-width: 30vw; max-width: 60vw;width: fit-content;padding: 5px;");
    const text = document.createElement('p');
    text.innerText = msg;
    const time = document.createElement('span');
    time.setAttribute('style', 'float: right; padding-bottom: 5px; opacity:0.5;')
    time.innerText = date.getHours() + ":" + date.getMinutes() + ", " + ("0" + date.getDate()).slice(-2) + "/" + monthNames[date.getMonth()];

    msgElement.appendChild(time);
    msgElement.appendChild(text);
    msgContainer.appendChild(msgElement);
}
function displayMap() {
    const mapElement = document.createElement('div');
    mapElement.setAttribute("class", "map");
    mapElement.setAttribute("style", "background-color: orange; margin-left:auto; margin-right:5px;border: 1px solid brown; width: 500px;height:300px;");
    msgContainer.appendChild(mapElement);
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
    displayMsgServer("Base on information of Corona REST API: \n"
        + "Name: " + data.name + "\n"
        + "Bundesland: " + data.bl + "\n"
        + "Cases: " + data.cases + "\n"
        + "Deaths: " + data.deaths + "\n"
        + "Death rate: " + Math.round(data.death_rate * 100) / 100 + "%" + "\n"
        + "Last update: " + data.last_update
        , color);
}
let listUser = document.getElementById("userListId");
let ulUser = document.createElement('ul');
ulUser.setAttribute('style', 'list-style: none;')
listUser.appendChild(ulUser);
function displayUserList(user) {
    clearListUser();
    for (x in user) {
        const listItem = document.createElement('li');
        const userId = document.createTextNode(' ' + user[x]);
        const icon = document.createElement('ion-icon');
        icon.setAttribute('name', 'person-outline');
        icon.setAttribute('style', 'color:yellow;')
        listItem.appendChild(icon);
        listItem.appendChild(userId);
        ulUser.appendChild(listItem);
    }
}
function clearListUser() {
    while (ulUser.hasChildNodes()) {
        ulUser.removeChild(ulUser.firstChild);
    }
}
