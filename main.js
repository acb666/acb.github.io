const socket = io();
window.location.href = '/login.html';
// 显示当前用户名
function showUsername() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('currentUsername').textContent = `当前用户: ${username}`;
        socket.emit('login', username); // 通知服务器用户已登录
    } else {
        alert('请先登录');
        window.location.href = '/login.html';
    }
}

// 更新在线用户列表
socket.on('updateOnlineUsers', (users) => {
    const onlineUsers = document.getElementById('onlineUsers');
    const targetUser = document.getElementById('targetUser');
    const currentUsername = localStorage.getItem('username'); // 获取当前用户名

    onlineUsers.innerHTML = '';
    targetUser.innerHTML = '<option value="">所有人</option>';

    users.forEach(user => {
        // 过滤掉当前用户
        if (user !== currentUsername) {
            // 添加在线用户到列表
            const li = document.createElement('li');
            li.textContent = user;
            onlineUsers.appendChild(li);

            // 添加在线用户到私聊下拉框
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            targetUser.appendChild(option);
        }
    });
});

// 显示消息历史
socket.on('messageHistory', (messages) => {
    const messagesContainer = document.getElementById('messages');
    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        if (msg.isPrivate) {
            messageElement.textContent = `[私聊 ${msg.username}] ${msg.message}`;
            messageElement.style.color = 'purple';
        } else {
            messageElement.textContent = `[${msg.username}] ${msg.message}`;
        }
        messagesContainer.appendChild(messageElement);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// 接收消息
socket.on('message', (data) => {
    const messages = document.getElementById('messages');
    const messageElement = document.createElement('div');
    if (data.isPrivate) {
        messageElement.textContent = `[私聊 ${data.username}] ${data.message}`;
        messageElement.style.color = 'purple';
    } else {
        messageElement.textContent = `[${data.username}] ${data.message}`;
    }
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});

// 发送消息
function sendMessage() {
    const message = document.getElementById('messageInput').value.trim();
    const username = localStorage.getItem('username');
    const targetUser = document.getElementById('targetUser').value;

    if (message && username) {
        if (targetUser === username) {
            alert('不能给自己发送私聊消息！');
            return;
        }
        socket.emit('sendMessage', { username, message, targetUser });
        document.getElementById('messageInput').value = '';
    } else {
        alert('请先登录');
        window.location.href = '/login.html';
    }
}

// 登出
function logout() {
    localStorage.removeItem('username'); // 清除用户名
    window.location.href = '/login.html'; // 跳转到登录页面
}

// 页面加载时显示用户名
window.onload = () => {
    showUsername();
};

// 登录
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 检查用户名和密码是否为空
    if (!username || !password) {
        alert('用户名和密码不能为空');
        return;
    }

    // 发送登录请求
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === '登录成功') {
            localStorage.setItem('username', username); // 存储用户名
            window.location.href = '/index.html'; // 跳转到聊天室页面
        } else {
            alert(data.message); // 显示错误信息
        }
    })
    .catch(error => {
        console.error('登录请求失败:', error);
        alert('登录请求失败，请检查网络连接');
    });
}

// 注册
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 检查用户名和密码是否为空
    if (!username || !password) {
        alert('用户名和密码不能为空');
        return;
    }

    // 发送注册请求
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message === '注册成功') {
            window.location.href = '/login.html'; // 跳转到登录页面
        }
    })
    .catch(error => {
        console.error('注册请求失败:', error);
        alert('注册请求失败，请检查网络连接');
    });
}
