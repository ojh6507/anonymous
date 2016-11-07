const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const connections = new Map();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

let currentUser = null;



io.on('connection', function(socket) {
    console.log('A user connected');

    let currentUser = socket.id;

    // key: socket.id, value: { busy ? }
    connections.set(currentUser, false);

    socket.on('get random', function(data) {
        var randomUser = getOneRandomUser(connections, data);
        connections.set(randomUser, true);
        connections.set(currentUser, true);
        socket.emit('assign-random', randomUser);
        io.to(randomUser).emit('got one', currentUser);     
    });


    socket.on('private chat', function(data) {
        console.log(data);
        io.to(data.to).emit('message append', data.message);
    });

    socket.on('disconnect', function() {
        if (connections.has(currentUser)) {
            console.log('Removing ' + currentUser);
            connections.delete(currentUser);
        }
    });

});

const getOneRandomUser = (connections, user) => {
    let unqArr = Array.from(connections);
    let length = unqArr.length;
    let randomUser = unqArr[getRandomInt(0, length)];
    console.log(randomUser);
    if (!randomUser)
        getOneRandomUser(connections, user);
    if (user != randomUser[0] && !randomUser[1])
        return randomUser[0];
    else
        getOneRandomUser(connections, user);
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


app.get('/getAll', function(req, res) {
    res.json(Array.from(connections));
});

server.listen(3000);
