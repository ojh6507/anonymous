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

Array.prototype.getRandom = function(last) {
   if ( this.length <= 1) {
    return;
   } else {
      var num = 0;
      do {
         num = Math.floor(Math.random() * this.length);
         console.log(this[num]);
      } while (this[num][0] == last || this[num][1]);
      return this[num][0];
   }
}

function getCountOfFreeUser(arr) {
    let count = 0;
    for ( let i = 0; i < arr.length; i++ ) {
        if (!arr[i][1]) {
            count ++;
        }
    }
    return count;
}

io.on('connection', function(socket) {
    console.log('A user connected');

    let currentUser = socket.id;

    // key: socket.id, value: { busy ? }
    connections.set(currentUser, false);

    socket.on('get random', function(data) {
        var unqArr =  Array.from(connections);
        if ( unqArr.length <= 1 ) {
            socket.emit('unexpected', "Not enough Users found");
        } else if (getCountOfFreeUser(unqArr) < 2) {
            socket.emit('unexpected', "Not enough Free Users found");
        } else {
        var randomUser = unqArr.getRandom(data);
        console.log("Random: " + randomUser);
        if (randomUser != undefined) {
            connections.set(randomUser, true);
            connections.set(currentUser, true);
            socket.emit('assign-random', randomUser);
            io.to(randomUser).emit('got one', currentUser);
        } else {
            socket.emit('unexpected', "No one found");
        }
    }
    });


    socket.on('private chat', function(data) {
        console.log(data);
        io.to(data.to).emit('message append', data.message);
    });

    socket.on('remove', function(data) {
        connections.set(data.from, false);
        connections.set(data.to, false);
    });

    socket.on('disconnect', function() {
        if (connections.has(currentUser)) {
            console.log('Removing ' + currentUser);
            connections.delete(currentUser);
        }
    });

});


app.get('/getAll', function(req, res) {
    res.json(Array.from(connections));
});

server.listen(3000);
