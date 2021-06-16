const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
    debug: true,
})

const port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/', (req, res, next) => {
    res.redirect(`/${uuidv4()}`);
})

app.get('/thankyou' , (req, res, next) => {
    res.render('thankyou');
})

app.get('/:roomId', (req, res, next) => {
    res.render('index', { roomId: req.params.roomId });
})

const allRoom = new Object();

io.on('connection', socket => {

    socket.on('join-room', (roomId, userId , userName) => {
        
        if(allRoom[roomId] == undefined) {
            allRoom[roomId] = 0;
        }    

        if (allRoom[roomId] < 2) {
            
            socket.join(roomId);
            allRoom[roomId]++;
            

            socket.broadcast.to(roomId).emit('guest-connected', userId , userName);
            
            socket.on('disconnect', () => {
                socket.broadcast.to(roomId).emit('user-disconnect', userId , userName);
                allRoom[roomId]--;
                
            })

            socket.on('recivedcall' , otherUserName => {
                socket.broadcast.to(roomId).emit('guestJoindMessage', otherUserName);
            })
            
            socket.on('leaveMeetting', () => {
                socket.broadcast.to(roomId).emit('user-disconnect', userId);
                allRoom[roomId]--;
            })
            
            socket.on('sendMessage' , (msg , name) => {
                socket.broadcast.to(roomId).emit('reciveMessage' , msg , name);
            })
        }else{
            socket.emit('custom-err' , 'You are not allowed to join this room');
        }

    })


})

server.listen(port, () => {
    console.log("Server running on port "+port);
})