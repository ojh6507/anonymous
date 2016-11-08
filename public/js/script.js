var chatscreen = $('#chatscreen');
var message = $('#message');
message.prop('disabled', 'disabled');
var socket = io.connect('http://localhost:3000');

var ctnBtn = $('#ctnBtn');
var disBtn = $('#disBtn');
var count = $('#count');

disBtn.hide();


var st = $('#st');
var title = $('#title');

var log = function(a) {
  console.log(a);
}

ctnBtn.click(function(e) {
  title.html("Connecting");
  st.html("Connecting");
  e.preventDefault();
  log(socket.id)
  socket.emit('get random', socket.id );
});



var random = null;


socket.on('assign-random', function(data) {
  if (data) {
    random = data;
    title.html("Connected");
    st.html('Connected');
    message.prop('disabled', false);
    disBtn.show();
    ctnBtn.hide();
  } else {
    title.html("Retry");
    st.html('Retry');
  }
});

socket.on('got one', function(data) {
  if (data) {
    random = data;
    title.html("Connected");
    st.html('Connected');
    message.prop('disabled', false);
    disBtn.show();
    ctnBtn.hide();
  } else {
message.prop('disabled', 'disabled');
    title.html("Retry");
    st.html('Retry');
  }
});

message.keyup(function(event) { 
  var msg = message.val().trim();
  if (event.keyCode == 13 && msg != '') {
    message.val('');
    chatscreen.append('<li>'+msg+'</li>');
    var sendData = {message: msg, from: socket.id, to: random};
    log(sendData);
    socket.emit('private chat', sendData);
  }
});

socket.on('message append', function(msg) {
  chatscreen.append('<li>'+msg+'</li>');
});

disBtn.click(function(event) {
  socket.emit('remove', {from: socket.id, to: random});
  chatscreen.html('');
  title.html("Find a stranger");
  st.html('Find a stranger');
  disBtn.fadeOut();
  ctnBtn.fadeIn();
message.prop('disabled', 'disabled');

});


socket.on('stranger leave', function() {
  chatscreen.html('');
  title.html("Find a stranger");
  st.html('Find a stranger');
  disBtn.fadeOut();
  ctnBtn.fadeIn();
message.prop('disabled', 'disabled');
  
});

socket.on('unexpected', function(data) {
  title.html(data);
  st.html(data);
});

socket.on('a user join', function(num) {
  count.html('Users online:' + num);
});

socket.on('a user leave', function(num) {
  count.html('Users online:' + num);
});

