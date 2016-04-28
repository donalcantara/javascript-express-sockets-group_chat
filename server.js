var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, './static')));

console.log(__dirname);

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.render('index');
})

var server = app.listen(8001, function(){
  console.log('Listening to a fun group chat on port 8001');
})

var users = {"Jimmy": true};
var history = [];

// console.log(server);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  console.log("WE ARE USING SOCKETS!");
  console.log(socket.id + ' has connected!');

  // event for creating a new user
  socket.on('creating:user', function(data){
    console.log(data);
    if(users[data.username] || data.username == null || data.username == ''){
      socket.emit('failed:user', {error: 'username exists'})
    }else{
      users[data.username] = data.username;
      socket.emit('success:user', {message: 'username accepted!', history: history})
    }
  })

  // event for handling a new message
  socket.on('new:chat', function(data){
    history.push(data.text);
    socket.broadcast.emit('get:chat', {message: data.text})
  })

  // listener for handling a disconnect
  socket.on('disconnect', function(){
    console.log(socket.id + ' has disconnected!')
  })
})
