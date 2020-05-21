
const socket = io.connect('localhost:3000');
const msgContainer = document.getElementById('msg-container');
const msgForm = document.getElementById('chatbox-form');
const msgInput = document.getElementById('msgInput');
const helloID = document.getElementById('hello-id');
const name = prompt("enter your name");
displayMsgClient("You joined");
window.scrollTo(0, 900);
socket.emit('new-user', name);
helloID.innerHTML = "Hello " + name;
socket.on('user-exist', name => {
    const newname = prompt("name has already existed, choose new one:");
    socket.emit('new-user', newname);
    helloID.innerHTML = "Hello " + newname;
})
socket.on('ask-msg', (data) => {
    displayMsgServer(data.name + " asked about corona statisic of " + data.message + "!");
    window.scrollTo(0, 900);
});
socket.on('info-corona', (data) => {
    if (data === null) {
        displayMsgServer("We don't have information about this city");
        window.scrollTo(0, 900);
    } else {
        displayMsgServer("Base on information of Corona REST API:")
        displayMsgServer("Name: " + data.name);
        displayMsgServer("Bundesland: " + data.bl);
        displayMsgServer("Cases: " + data.cases);
        displayMsgServer("Deaths: " + data.deaths);
        displayMsgServer("Death rate: " + Math.round(data.death_rate * 100) / 100 + "%");
        displayMsgServer("Last update: " + data.last_update);
        window.scrollTo(0, 900);
    }
});
socket.on('chat-msg', data => {
    displayMsgServer(data.name+ " said: " + data.message);
    window.scrollTo(0, 900);
})
socket.on('user-connect', name => {
    displayMsgServer(name + " is connected");
    window.scrollTo(0, 900);
})
msgForm.addEventListener('submit', e => {
    e.preventDefault();
    let msg = msgInput.value;
    if (msg.includes("About")) {
        outmsg = msg.replace("About ","");
        displayMsgClient("You asked about corona statisic of " + outmsg);
        window.scrollTo(0, 900);
    } else{
        displayMsgClient("You said: " + msg);
        window.scrollTo(0, 900);
    }
    socket.emit('send-msg', msg);
    msgInput.value = '';
});
function displayMsgClient(msg) {
    const msgElement = document.createElement('div');
    msgElement.setAttribute("style", "background-color: white;");
    msgElement.innerText = msg;
    msgContainer.append(msgElement);
}
function displayMsgServer(msg) {
    const msgElement = document.createElement('div');
    msgElement.setAttribute("style", "background-color: orange; margin-left:auto; margin-right:5px;");
    msgElement.innerText = msg;
    msgContainer.append(msgElement);
}
function clearChat() {
    while (msgContainer.hasChildNodes()) {
        msgContainer.removeChild(msgContainer.firstChild);
    }
}