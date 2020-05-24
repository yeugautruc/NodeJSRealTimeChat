
const socket = io.connect('localhost:8080');
const msgContainer = document.getElementById('msg-container');
const msgForm = document.getElementById('chatbox-form');
const msgInput = document.getElementById('msgInput');
const helloID = document.getElementById('hello-id');
const name = prompt("enter your name");
displayMsgClient("You joined");
window.scrollTo(0,document.body.scrollHeight);
socket.emit('new-user', name);
helloID.innerHTML = "Hello " + name;
socket.on('user-exist', name => {
    const newname = prompt("name has already existed, choose new one:");
    socket.emit('new-user', newname);
    helloID.innerHTML = "Hello " + newname;
})
socket.on('ask-msg', (data) => {
    displayMsgServer(data.name + " asked about corona statisic of " + data.message + "!");
    window.scrollTo(0,document.body.scrollHeight);
});
socket.on('info-corona', (data) => {
    if (data === null) {
        displayMsgServer("We don't have information about this city");
        window.scrollTo(0,document.body.scrollHeight);
    } else {
        displayMsgServer("Base on information of Corona REST API:")
        displayMsgServer("Name: " + data.name);
        displayMsgServer("Bundesland: " + data.bl);
        displayMsgServer("Cases: " + data.cases);
        displayMsgServer("Deaths: " + data.deaths);
        displayMsgServer("Death rate: " + Math.round(data.death_rate * 100) / 100 + "%");
        displayMsgServer("Last update: " + data.last_update);
        window.scrollTo(0,document.body.scrollHeight);
    }
});
socket.on('chat-msg', data => {
    displayMsgServer(data.name + " said: " + data.message);
    window.scrollTo(0,document.body.scrollHeight);
})
socket.on('user-connect', name => {
    displayMsgServer(name + " is connected");
    window.scrollTo(0,document.body.scrollHeight);
})
socket.on('broadcast-map',data=>{
    displayMap();
    console.log(data);
    initialize(data.lat,data.lng);
    window.scrollTo(0,document.body.scrollHeight);
})
msgForm.addEventListener('submit', e => {
    e.preventDefault();
    let msg = msgInput.value;
    if (msg.includes("corona")) {
        outmsg = msg.replace("corona ", "");
        displayMsgClient("You asked about corona statisic of " + outmsg);
        window.scrollTo(0,document.body.scrollHeight);
    }
    else if (msg.includes("show")) {
        msg = msg.replace("show ", "");
        displayMsgClient("You asked to show " + msg);
        let location = msg;
        let url = 'https://maps.googleapis.com/maps/api/geocode/json?&key=AIzaSyC_0nX6TjfZ03keMMM3_wTDZZ3QenuX2cc&address=' + location;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayMap();
                initialize(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
                socket.emit('send-map', {lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng});
                window.scrollTo(0,document.body.scrollHeight);
            })
            .catch(err => { })
        msg = "Show "+msg;
    }
    else {
        displayMsgClient("You said: " + msg);
        window.scrollTo(0,document.body.scrollHeight);
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
function displayMsgServer(msg) {
    const msgElement = document.createElement('div');
    msgElement.setAttribute("style", "background-color: #f3edfa; margin-left:auto; margin-right:5px;border: 0.5px solid red;width: fit-content;padding: 5px;");
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
    for (var i = elements.length-1; i < elements.length; i++) {
        map = new google.maps.Map(elements[i],
            mapOptions);
    }

};
