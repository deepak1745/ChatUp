// <!-- Copyright 2016 Deepak Kumar
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// This code is written by Deepak Kumar -->

var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var fs= require('fs');

app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', function (req, res) {
    console.log(req.files.displayImage.path);
});

app.get('/getChatHistory', function(req, res){
  fs.readFile('chatHistory.json', function(err, chatHistory){
    chatHistory=JSON.parse(chatHistory);
    res.json(chatHistory);
  });
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(e){

    console.log('user disconnected');

  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);

    var data={
      name: msg[0],
      message: msg[1]
    };

    fs.readFile('chatHistory.json', function(err, chatHistory){
      chatHistory=JSON.parse(chatHistory);
      chatHistory.push(data);
      fs.writeFile('chatHistory.json', JSON.stringify(chatHistory), function(){
          console.log('chat history updated successfully');
      });
    });
  });

  socket.on('online', function(name){
    io.emit('online', name+' is online');
  });

  socket.on('typing message', function(name){

    io.emit('typing message', name + ' is typing..');
  });

  socket.on('delete lastmessage', function(name){

    io.emit('delete lastmessage', name);
  });

  socket.on('delete secondlastmessage', function(name){

    io.emit('delete secondlastmessage', name);
  });

  socket.on('image', function(path){
    fs.readFile(path, function(err, buf){
    io.emit('image', { image: true, buffer: buf.toString('base64') });
      console.log('image file is initialized');
    });
  });
});

// io.on('connection', function(socket){
//   fs.readFile('public/images/landscape.jpg', function(err, buf){
//     // it's possible to embed binary data
//     // within arbitrarily-complex objects
//
//   socket.emit('image', { image: true, buffer: buf.toString('base64') });
//     console.log('image file is initialized');
//   });
// });

http.listen(8000, function(){
  console.log('listening on *:80');
});
