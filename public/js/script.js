'use strict';

var socket = io();

var typing = $('#typing');
typing.hide();
var ctnBtn = $('#ctnBtn');
var disBtn = $('#disBtn');
var count = $('#count');
var $input = $('#input');
$input.prop('disabled', true);

var $send = $('#send');
var $content = $('#content');
var $inner = $('#inner');
disBtn.hide();


var st = $('#st');



function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
var Messenger = function() {
    function Messenger() {
        _classCallCheck(this, Messenger);
        this.messageList = [];
        this.deletedList = [];
        this.me = 1;
        this.them = 5;
        this.onRecieve = function(message) {
            return console.log('Recieved: ' + message.text);
        };
        this.onSend = function(message) {
            return console.log('Sent: ' + message.text);
        };
        this.onDelete = function(message) {
            return console.log('Deleted: ' + message.text);
        };
    }
    Messenger.prototype.send = function send() {
        var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        text = this.filter(text);
        if (this.validate(text)) {
            var message = {
                user: this.me,
                text: text,
                time: new Date().getTime()
            };
            this.messageList.push(message);
            this.onSend(message);
        }
    };
    Messenger.prototype.recieve = function recieve() {
        var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        text = this.filter(text);
        if (this.validate(text)) {
            var message = {
                user: this.them,
                text: text,
                time: new Date().getTime()
            };
            this.messageList.push(message);
            this.onRecieve(message);
        }
    };
    Messenger.prototype.delete = function _delete(index) {
        index = index || this.messageLength - 1;
        var deleted = this.messageLength.pop();
        this.deletedList.push(deleted);
        this.onDelete(deleted);
    };
    Messenger.prototype.filter = function filter(input) {
        var output = input.replace('bad input', 'good output');
        return output;
    };
    Messenger.prototype.validate = function validate(input) {
        return !!input.length;
    };
    return Messenger;
}();
var BuildHTML = function() {
    function BuildHTML() {
        _classCallCheck(this, BuildHTML);
        this.messageWrapper = 'message-wrapper';
        this.circleWrapper = 'circle-wrapper';
        this.textWrapper = 'text-wrapper';
        this.meClass = 'me';
        this.themClass = 'them';
    }
    BuildHTML.prototype._build = function _build(text, who) {
        return '<div class="' + this.messageWrapper + ' ' + this[who + 'Class'] + '">\n              <div class="' + this.circleWrapper + ' animated bounceIn"></div>\n              <div class="' + this.textWrapper + '">...</div>\n            </div>';
    };
    BuildHTML.prototype.me = function me(text) {
        return this._build(text, 'me');
    };
    BuildHTML.prototype.them = function them(text) {
        return this._build(text, 'them');
    };
    return BuildHTML;
}();

$(document).ready(function() {
    var messenger = new Messenger();
    var buildHTML = new BuildHTML();


    function safeText(text) {
        $content.find('.message-wrapper').last().find('.text-wrapper').text(text);
    }

    function animateText() {
        setTimeout(function() {
            $content.find('.message-wrapper').last().find('.text-wrapper').addClass('animated fadeIn');
        }, 200);
    }

    function scrollBottom() {
    
        $($inner).animate({
            scrollTop: $($content).offset().top + $($content).outerHeight(true)
        }, {
            queue: true,
            duration: 'ease'
        });
    }

    function buildSent(message) {
        console.log('sending: ', message.text);
        $content.append(buildHTML.me(message.text));
        safeText(message.text);
        animateText();
        scrollBottom();
    }

    function buildRecieved(message) {
        console.log('recieving: ', message.text);
        $content.append(buildHTML.them(message.text));
        safeText(message.text);
        animateText();
        scrollBottom();
    }

    function sendMessage() {
        var text = $input.val();
        var sendData = {
            message: text,
            from: socket.id,
            to: random
        };
        log(sendData);
        socket.emit('private chat', sendData);
        messenger.send(text);
        $input.val('');
        $input.focus();
    }

    messenger.onSend = buildSent;
    messenger.onRecieve = buildRecieved;

    //
    // setTimeout(function () {
    //     messenger.recieve('Hello there!');
    // }, 1500);
    // setTimeout(function () {
    //     messenger.recieve('Do you like this? If so check out more on my page...');
    // }, 5000);
    // setTimeout(function () {
    //     messenger.recieve('Or maybe just give it a like!');
    // }, 7500);
    //

    $send.on('click', function(e) {
        sendMessage();
        $input.focus();
    });

    $input.on('keydown', function(e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
            e.preventDefault();
            sendMessage();
            $input.focus();
        }
    });


    var log = function(a) {
        console.log(a);
    }

    ctnBtn.click(function(e) {
        st.html("Connecting");
        e.preventDefault();
        socket.emit('get random');
    });



    var random = null;


    socket.on('assign-random', function(data) {
        if (data) {
            random = data;

            st.html('Connected');
            $input.prop('disabled', false);
            disBtn.fadeIn();
            ctnBtn.fadeOut();
        } else {

            st.html('Retry');
        }
    });

    socket.on('got one', function(data) {
        if (data) {
            random = data;

            st.html('Connected');
            $input.prop('disabled', false);
            disBtn.fadeIn();
            ctnBtn.fadeOut();
        } else {
            $input.prop('disabled', true);

            st.html('Retry');
        }
    });

    // message.keyup(function(event) {
    //     var msg = message.val().trim();
    //     if (event.keyCode == 13 && msg != '') {
    //         message.val('');
    //         chatscreen.append('<div>Me: ' + msg + '</div>');
    //
    //     }
    // });

    socket.on('message append', function(msg) {
        messenger.recieve(msg);
    });

    disBtn.click(function(event) {
        socket.emit('remove', {
            from: socket.id,
            to: random
        });
        $content.html('');
        st.html('Not Connected');
        disBtn.fadeOut();
        ctnBtn.fadeIn();
        $input.prop('disabled', true);

    });


    socket.on('stranger leave', function() {
        $('.wrapper').slideUp('fast', function () {
          alert('Hey! You are thrown out');
          window.location.href = '/';
        });
        // $content.html('');
        // st.html('Not Connected');
        // disBtn.fadeOut();
        // ctnBtn.fadeIn();
        // $input.prop('disabled', true);
    });

    socket.on('stranger disconnect', function () {
      $content.html('');
      st.html('Not Connected');
      disBtn.fadeOut();
      ctnBtn.fadeIn();
      $input.prop('disabled', true);
    });

    socket.on('unexpected', function(data) {
        st.html(data);
    });

    socket.on('a user join', function(num) {
        count.html('' + num);
    });

    socket.on('a user leave', function(num) {
        count.html('' + num);
    });

    socket.on('stranger typing start', function() {
        typing.fadeIn();
    });

    socket.on('stranger typing stop', function() {
        typing.fadeOut();
    });

    $input.keypress(function(event) {
        socket.emit('typing start', random);
    });


});
