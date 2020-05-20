
const socket = io.connect('http://localhost:3000');
const msgContainer = document.getElementById('chatbox-container');
const msgForm = document.getElementById('chatbox-form');
const msgInput = document.getElementById('msgInput');
socket.on('chat-msg', (data) => {
    displayMsg(data);
});
msgForm.addEventListener('submit', e => {
    e.preventDefault();
    const msg = msgInput.value;
    console.log(msg);
    socket.emit('send-msg', msg);
    msgInput.value = '';
});
function displayMsg(msg){
    const msgElement = document.createElement('div');
    msgElement.innerText=msg;
    msgContainer.append(msgElement);
}