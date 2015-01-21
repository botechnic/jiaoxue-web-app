//
// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
//
//var url = '../../web/compressed.tracemonkey-pldi-09.pdf';
var pdf_url = global_info.pdf_addr;

//
// Disable workers to avoid yet another cross-origin issue (workers need
// the URL of the script to be loaded, and dynamically loading a cross-origin
// script does not work).
//
//   PDFJS.disableWorker = true;

//
// In cases when the pdf.worker.js is located at the different folder than the
// pdf.js's one, or the pdf.js is executed via eval(), the workerSrc property
// shall be specified.
//
// PDFJS.workerSrc = '../../build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

var socket = null;

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
            ctx.strokeStyle = "red";
            ctx.lineWidth = 3;

        });
    });

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
    socket.emit('prev', { pageNum: pageNum });
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
    socket.emit('next', { pageNum: pageNum });
}
document.getElementById('next').addEventListener('click', onNextPage);

/**
 * Asynchronously downloads PDF.
 */
PDFJS.getDocument(pdf_url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
});

/**
 * chat and whiteboard
 */
socket = io.connect(global_info.socketio_addr);

/*socket.on('new message', function (data) {
    console.log(data);
});*/

var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms
var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

// Initialize varibles
var $window = $(window);
var $usernameInput = $('.usernameInput'); // Input for username
var $messages = $('.messages'); // Messages area
var $inputMessage = $('.inputMessage'); // Input message input box

var $loginPage = $('.login.page'); // The login page
var $chatPage = $('.chat.page'); // The chatroom page

// Prompt for setting a username
var username;
var connected = false;
var typing = false;
var lastTypingTime;
var $currentInput = $usernameInput.focus();

//var socket = io.connect('http://pano.botechnic.com:3000');


/*function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }*/

function set_user_name() {
    //username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
        //$loginPage.fadeOut();
        $chatPage.show();
        //$loginPage.off('click');
        //$currentInput = $inputMessage.focus();

        // Tell the server your username
        socket.emit('add user', { role: 'teacher', username: username });
    }
}

function add_user() {
    //var username_ = document.getElementById('username').value;
    var username_ = global_info.userid;
    username = username_;
    set_user_name();
    //socket.emit('add user', { role: 'teacher', username: username });
}




// Sets the client's username
function setUsername() {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        //$currentInput = $inputMessage.focus();

        // Tell the server your username
        socket.emit('add user', { role: 'teacher', username: username });
    }
}

// Sends a chat message
function sendMessage() {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
        $inputMessage.val('');
        addChatMessage({
            username: username,
            message: message
        });
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message', message);
    }
}

// Log a message
function log(message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
}

// Adds the visual chat message to the message list
function addChatMessage(data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
}


/*function addChatTyping (data) {
  data.typing = true;
  data.message = 'is typing';
  addChatMessage(data);
}*/

// Removes the visual chat typing message
/*function removeChatTyping (data) {
  getTypingMessages(data).fadeOut(function () {
    $(this).remove();
  });
}*/

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
//   all other messages (default = false)
function addMessageElement(el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
        options = {};
    }
    if (typeof options.fade === 'undefined') {
        options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
        options.prepend = false;
    }

    // Apply options
    if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
        $messages.prepend($el);
    } else {
        $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
}

// Prevents input from having injected markup
function cleanInput(input) {
    return $('<div/>').text(input).text();
}

// Updates the typing event
/*function updateTyping () {
  if (connected) {
    if (!typing) {
      typing = true;
      socket.emit('typing');
    }
    lastTypingTime = (new Date()).getTime();

    setTimeout(function () {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
        socket.emit('stop typing');
        typing = false;
      }
    }, TYPING_TIMER_LENGTH);
  }
}*/

// Gets the 'X is typing' messages of a user
function getTypingMessages(data) {
    return $('.typing.message').filter(function (i) {
        return $(this).data('username') === data.username;
    });
}

// Gets the color of a username through our hash function
function getUsernameColor(username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
}

// Keyboard events

$window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
        if (username) {
            sendMessage();
            //socket.emit('stop typing');
            typing = false;
        } else {
            setUsername();
        }
    }
});

/*$inputMessage.on('input', function() {
  updateTyping();
});*/

// Click events

// Focus input when clicking anywhere on login page
$loginPage.click(function () {
    $currentInput.focus();
});

// Focus input when clicking on the message input's border
$inputMessage.click(function () {
    //$inputMessage.focus();
});

// Socket events

// Whenever the server emits 'login', log the login message
socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    /*var message = "Welcome to Socket.IO Chat C ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);*/
});

// Whenever the server emits 'new message', update the chat body
socket.on('new message', function (data) {
    console.log('new message');
    addChatMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
/*socket.on('user joined', function (data) {
  log(data.username + ' joined');
  addParticipantsMessage(data);
});*/

// Whenever the server emits 'user left', log it in the chat body
/*socket.on('user left', function (data) {
  log(data.username + ' left');
  addParticipantsMessage(data);
  removeChatTyping(data);
});*/

// Whenever the server emits 'typing', show the typing message
/*socket.on('typing', function (data) {
  addChatTyping(data);
});*/

// Whenever the server emits 'stop typing', kill the typing message
/*socket.on('stop typing', function (data) {
  removeChatTyping(data);
});*/

///////////////////////////////////////////////////
//  
//


function start_record() {
    pageNum = 1;
    //renderPage(pageNum);
    console.log('start_record');
    //var course_id = parseInt(document.getElementById('course_id').value);
    var course_id = global_info.course_id;
    socket.emit('start_record', { record: true, course_id: course_id });
    socket.emit('next', { pageNum: pageNum });
}

function stop_record() {
    console.log('stop_record');

    if(socket) {
        socket.emit('stop_record', { record: false });
    }    
}

function start_playlive() {
    var course_id = global_info.course_id;    

    socket.emit('start_playlive', { course_id: course_id });
}

function stop_playlive() {
    //var course_id = parseInt(document.getElementById('course_id').value);
    var course_id = global_info.course_id;

    socket.emit('stop_playlive', { course_id: course_id });
}

socket.on('connect', function () {
    console.log('connected');
    add_user();

    //start_record();
    start_playlive();
});

window.onbeforeunload = function () {
    return " ";
};

//document.getElementById('add_user').addEventListener('click', add_user);
document.getElementById('start_record').addEventListener('click', start_record);
document.getElementById('stop_record').addEventListener('click', stop_record);

var pp = false;

var interval_handler = null;
var mousemove_capture_flag = true;
var interval_function = function () {
    mousemove_capture_flag = true;
};

canvas.addEventListener('mousedown', function (e) {
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
    /*mouseX *= 2;
    mouseY *= 2;*/
    pp = true;
    ctx.moveTo(mouseX, mouseY);
    socket.emit('mousedown', { mouseX: mouseX, mouseY: mouseY });

    // start interval
    interval_handler = setInterval(interval_function, 40);

});

canvas.addEventListener('mouseup', function (e) {
    pp = false;
    socket.emit('mouseup', { pp: false });

    clearInterval(interval_handler);
    interval_handler = null;
});


canvas.addEventListener('mousemove', function (e) {

    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
    /*mouseX *= 2;
    mouseY *= 2;*/
    if (pp == true && mousemove_capture_flag == true) {
        ctx.lineTo(mouseX, mouseY);
        socket.emit('mousemove', { mouseX: mouseX, mouseY: mouseY, pp: pp });
        ctx.stroke();

        mousemove_capture_flag = false;
    }

});

/**
 * rtmp
 */
var flashvars = {
    streamer: global_info.publish_addr,
    file: ""+global_info.course_id,
    onStopRecord: 'stopRecord',
    onError: 'error',
    publishType: 'live',
    labelRecord: 'start',
    labelStop: 'stop'
};
var params = {
    menu: "false",
    scale: "noScale",
    allowFullscreen: "true",
    allowScriptAccess: "always",
    bgcolor: "black",
    wmode: "direct" // can cause issues with FP settings & webcam
};
var attributes = {
    id: "RtmpLiveEncoder"
};
swfobject.embedSWF(
    "./asset/RtmpLiveEncoder.swf",
    "altContent", "500", "400", "11.0.0",
    "./asset/expressInstall.swf",
    flashvars, params, attributes);
