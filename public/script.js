const socket = io();

const loginPage = document.getElementById('login-page');
const chatPage = document.getElementById('chat-page');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');
const backButton = document.getElementById('back-btn');

let username = localStorage.getItem('vp-username');

function showChatUI() {
  loginPage.classList.add('hidden');
  chatPage.classList.remove('hidden');
}

function showLoginUI() {
  chatPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
}

if (username) {
  showChatUI();
  socket.emit('new-user', username);
} else {
  showLoginUI();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (username) {
    localStorage.setItem('vp-username', username);
    showChatUI();
    socket.emit('new-user', username);
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('send-message', { username, message });
    addMessage(username, message, true);
    messageInput.value = '';
  }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

backButton.addEventListener('click', () => {
  localStorage.removeItem('vp-username');
  location.reload();
});

function addMessage(sender, message, isSelf = false) {
  const div = document.createElement('div');
  div.innerHTML = `<span class="font-semibold">${sender}:</span> ${message}`;
  div.className = `max-w-xs p-2 rounded-lg text-sm ${isSelf ? 'bg-green-600 self-end text-right ml-auto' : 'bg-gray-700 self-start text-left mr-auto'}`;
  const wrapper = document.createElement('div');
  wrapper.className = `flex w-full ${isSelf ? 'justify-end' : 'justify-start'}`;
  wrapper.appendChild(div);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

socket.on('chat-message', ({ username: sender, message }) => {
  const isSelf = sender === username;
  if (!isSelf) addMessage(sender, message, false);
});

socket.on('update-users', (users) => {
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    li.className = 'bg-gray-700 p-2 rounded';
    userList.appendChild(li);
  });
});