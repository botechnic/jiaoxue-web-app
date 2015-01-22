var pdf_url = global_info.pdf_addr;
var pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null, scale = 2, canvas = document
		.getElementById('the-canvas'), ctx = canvas.getContext('2d');

var pdf_h = 0;
var pdf_w = 0;
var mouse_factor = 1;
var playback_volume = 0.8;

// /////////////////////////////////////////////////////////////////////////////
// ui part
// 
if (global_info.biz_type === 'live') {
	// TODO:
	// $("#live_controller").show();
	playback_bar_info_hide();
	$("#start_stop_record").hide();
	var media_container = document.getElementById('media_container');
	media_container.style.paddingTop = '10px';
	media_container.style.height = (media_container.clientHeight - 20) + 'px';

	$("#volume").show();
	$("#volume_bar_bg").show();
	$("#volume_bar_1").show();
	$("#volume_bar_2").show();
} else if (global_info.biz_type === 'playback') {
	// TODO:
	$("#player").hide();
	$("#start_stop_record").hide();
	$('#controls').hide();
} else if (global_info.biz_type === 'record') {
	playback_bar_info_hide();
	$("#player").hide();
	var media_container = document.getElementById('media_container');
	media_container.style.paddingTop = '10px';
	media_container.style.height = (media_container.clientHeight - 20) + 'px';

	/**
	 * rtmp
	 */
	

	var flashvars = {
		streamer : global_info.publish_addr,
		file : "" + global_info.course_id,
		onStopRecord : 'stopRecord',
		onError : 'testerror',
		publishType : 'live',
		labelRecord : 'start',
		labelStop : 'stop'
	};
	var params = {
		menu : "false",
		scale : "noScale",
		allowFullscreen : "true",
		allowScriptAccess : "always",
		bgcolor : "black",
		wmode : "direct" // can cause issues with FP settings & webcam
	};
	var attributes = {
		id : "RtmpLiveEncoder"
	};
	swfobject.embedSWF("./asset/RtmpLiveEncoder.swf", "altContent", "215",
			"138", "11.0.0", "./asset/expressInstall.swf", flashvars, params,
			attributes);
}

var user_access_mic = false;

function onActivityLevel(level) {
	// console.log(level);
	var index = parseInt(Number(level / 10).toFixed(0));

	for (var i = 0; i < 10; i++) {
		var index_ele = document.getElementById('vol_' + i);
		if (i >= index) {
			index_ele.style.backgroundColor = 'rgb(239,239,239)';
		} else {
			index_ele.style.backgroundColor = 'rgb(42,210,168)';
		}
	}
}

function testerror(ok) {
	console.log('err', ok);
	// return "kolya";

	if (ok === 'user_denied_mic' || ok === 'user_access_mic') {
		user_access_mic = true;
		var live_publish = document.getElementById('live_publish');
		live_publish.style.position = 'inherit';
		live_publish.style.width = '1px';
		live_publish.style.height = '1px';
		live_publish.style.top = '0px';
		live_publish.style.left = '0px';

		var rtmpLiveEncoder = document.getElementById('RtmpLiveEncoder');
		rtmpLiveEncoder.style.width = '1px';
		rtmpLiveEncoder.style.height = '1px';
	}

	if (ok === 'user_denied_mic') {
		// alert('please open your mic!');
		alert('请打开MIC！');
	}

	onresize();
}

function playback_bar_info_hide() {
	$("#play_pause").hide();
	$("#seek_bar").hide();
	$("#seek_bar_1").hide();
	$("#seek_bar_2").hide();
	$("#volume").hide();
	$("#volume_bar_bg").hide();
	$("#volume_bar_1").hide();
	$("#volume_bar_2").hide();
	$("#curr_pos").hide();
	$("#video_xiegang").hide();
	$("#range").hide();
	$("#video1").hide();
}

if (document.webkitIsFullScreen === undefined) {
	var full_screen = document.getElementById('full_screen');
	full_screen.style.display = 'none';
}

document.getElementById('teacher_name').textContent = global_info.teacher_name;

function resize_splitter() {
	var splitter = document.getElementById('splitter');
	var splitter_btn = document.getElementById('splitter_btn');

	splitter.style.height = window.innerHeight + "px";
	splitter_btn.style.top = (splitter.clientHeight / 2 - splitter_btn.clientHeight / 2)
			+ 'px';
}

function resize_right_panel() {
	var right_panel = document.getElementById('right_panel');
	var banner = document.getElementById('banner');
	var history_msg = document.getElementById('historyMsg');
	var controls = document.getElementById('controls');

	history_msg.style.height = (right_panel.clientHeight - banner.clientHeight
			- controls.clientHeight - 5 - 20 - 20)
			+ 'px';
}

function resize_left_panel() {
	var left_panel = document.getElementById('left_panel');
	var info_container = document.getElementById('info_container');
	var whiteboard_container = document.getElementById('whiteboard_container');
	var media_container = document.getElementById('media_container');

	whiteboard_container.style.height = (window.innerHeight - 20 - 20
			- info_container.clientHeight - media_container.clientHeight)
			+ 'px';

	var canvas = document.getElementById('the-canvas');

	var bili = pdf_w > pdf_h ? pdf_h/pdf_w : pdf_w/pdf_h;
	
	if(whiteboard_container.clientHeight / whiteboard_container.clientWidth <= bili) {
		canvas.style.height = (whiteboard_container.clientHeight - 20) + 'px';
		canvas.style.width = (whiteboard_container.clientHeight- 20) / bili	+ 'px';
		canvas.style.top = (whiteboard_container.clientHeight / 2 - 10 - canvas.clientHeight / 2)
				+ 'px';
	} else {
		canvas.style.width = (whiteboard_container.clientWidth - 20) + 'px';
		canvas.style.height = (whiteboard_container.clientWidth- 20) * bili + "px";
		canvas.style.top = (whiteboard_container.clientHeight / 2 - 10 - canvas.clientHeight / 2)
				+ 'px';
	}
	
//	if (whiteboard_container.clientHeight / whiteboard_container.clientWidth <= 0.75) {
//		canvas.style.height = (whiteboard_container.clientHeight - 20) + 'px';
//		canvas.style.width = (whiteboard_container.clientHeight / 0.75 - 20)
//				+ 'px';
//		canvas.style.top = (whiteboard_container.clientHeight / 2 - 10 - canvas.clientHeight / 2)
//				+ 'px';
//
//	} else {
//		canvas.style.width = (whiteboard_container.clientWidth - 20) + 'px';
//		canvas.style.height = (whiteboard_container.clientWidth * 0.75 - 20)
//				+ "px";
//		canvas.style.top = (whiteboard_container.clientHeight / 2 - 10 - canvas.clientHeight / 2)
//				+ 'px';
//	}

	mouse_factor = pdf_w / canvas.clientWidth;

	if (global_info.biz_type === 'playback') {
		resize_left_panel_playback();
	} else if (global_info.biz_type === 'record') {

	} else if (global_info.biz_type === 'live') {

	}
}

function resize_left_panel_playback() {
	var whiteboard_container = document.getElementById('whiteboard_container');
	var seek_bar_1 = document.getElementById('seek_bar_1');
	var seek_bar_2 = document.getElementById('seek_bar_2');
	var seek_bar_bg = document.getElementById('seek_bar_bg');
	seek_bar_1.style.width = (whiteboard_container.clientWidth) + 'px';
	seek_bar_bg.style.width = (whiteboard_container.clientWidth) + 'px';
	seek_bar_2.style.left = '0px';
}

function resize_panel() {
	var win_w = window.innerWidth;
	var win_h = window.innerHeight;
	var left_panel = document.getElementById('left_panel');
	var right_panel = document.getElementById('right_panel');

	left_panel.style.height = win_h - 20 + 'px';
	right_panel.style.height = win_h - 20 + 'px';

	left_panel.style.width = (win_w - 10 - 10 - 10 - right_panel.clientWidth)
			+ 'px';
}

function resize_panel_fullscreen() {
	var win_w = window.innerWidth;
	var win_h = window.innerHeight;
	var left_panel = document.getElementById('left_panel');
	var right_panel = document.getElementById('right_panel');

	left_panel.style.height = win_h - 20 + 'px';
	left_panel.style.width = (win_w - 10) + 'px';
}

function resize_live_publish() {
	var live_publish = document.getElementById('live_publish');
	// live_publish.style.left = (window.innerWidth / 2 - 215 / 2) + 'px';
	// live_publish.style.top = (window.innerHeight / 2 - 138 / 2) + 'px';
	live_publish.style.position = 'absolute';
	live_publish.style.left = '0px';
	live_publish.style.top = '0px';
	live_publish.style.backgroundColor = 'rgb(255,0,0)';
	live_publish.style.width = window.innerWidth + 'px';
	live_publish.style.height = window.innerHeight + 'px';
	live_publish.style.zIndex = 1000;

	var rtmpLiveEncoder = document.getElementById('RtmpLiveEncoder');
	rtmpLiveEncoder.style.left = (window.innerWidth / 2 - 215 / 2) + 'px';
	rtmpLiveEncoder.style.top = (window.innerHeight / 2 - 138 / 2) + 'px';
	rtmpLiveEncoder.style.width = window.innerWidth + 'px';
	rtmpLiveEncoder.style.height = window.innerHeight + 'px';
}

function onresize() {
	console.log('onresize');
	if (!document.webkitIsFullScreen) {
		resize_panel();
		resize_left_panel();
		resize_right_panel();
		resize_splitter();
	} else {
		resize_panel_fullscreen();
		resize_left_panel();
	}

	if (!user_access_mic && global_info.biz_type === 'record') {
		resize_live_publish();
	}

	resize_vol();
}

window.addEventListener('resize', onresize, false);

function init_vol_bar() {
	for (var i = 0; i < 10; i++) {
		var index_ele = document.getElementById('vol_' + i);
		index_ele.style.backgroundColor = 'rgb(239,239,239)';
	}
}

function init_user_num() {
	var number_users = document.getElementById('number_users');
	number_users.textContent = '0';
}

function resize_vol() {
	onActivityLevel(playback_volume * 100);

	var volume_bar_bg = document.getElementById('volume_bar_bg');
	var volume_bar_1 = document.getElementById('volume_bar_1');
	var volume_bar_2 = document.getElementById('volume_bar_2');
	volume_bar_1.style.width = volume_bar_bg.clientWidth * playback_volume
			+ 'px';
	volume_bar_2.style.left = volume_bar_1.clientWidth - 5 + 'px';
}

function flash_ok() {
	console.log('flash_ok');
	if (global_info.biz_type === 'record') {

	} else if (global_info.biz_type === 'live') {
		var player_id = document.getElementById('player_id');
		var volume = player_id.get_volume();
		var volume_bar_bg = document.getElementById('volume_bar_bg');
		var volume_bar_1 = document.getElementById('volume_bar_1');
		var volume_bar_2 = document.getElementById('volume_bar_2');
		volume_bar_1.style.width = volume_bar_bg.clientWidth * volume + 'px';
		volume_bar_2.style.left = volume_bar_1.clientWidth - 5 + 'px';

		onActivityLevel(volume * 100);

		console.log('volume' + volume);

	} else if (global_info.biz_type === 'playback') {

	}	
}

window.onload = function() {
	console.log('onload');
	// onresize();

	init_vol_bar();

	init_user_num();
	
	setTimeout(function(){
		console.log('settimeout');
		onresize();
		document.getElementById('teacher_body').style.visibility = 'visible';
		document.getElementById('teacher_body').style.zIndex = 0;	
	}, 1000);
	
}

function click_splitter_btn() {
	var right_panel = document.getElementById('right_panel');
	var left_panel = document.getElementById('left_panel');
	var splitter_btn = document.getElementById('splitter_btn');

	if (right_panel.style.display !== 'none') {
		right_panel.style.display = 'none';

		left_panel.style.width = (window.innerWidth - 10 - 10) + 'px';
		splitter_btn.src = 'img/splitter_btn_back.png';

	} else {
		left_panel.style.width = (window.innerWidth - 270 - 10 - 10 - 10)
				+ 'px';
		right_panel.style.display = 'block';
		splitter_btn.src = 'img/splitter_btn.png';
	}

	onresize();
}

document.getElementById('splitter_btn').addEventListener('click',
		click_splitter_btn);

function click_full_screen() {
	var left_panel = document.getElementById('left_panel');

	if (!document.webkitIsFullScreen) {
		left_panel.webkitRequestFullScreen();
	} else {
		document.webkitCancelFullScreen();
	}
}

function cancel_full_screen() {
	var left_panel = document.getElementById('left_panel');
	var full_screen = document.getElementById('full_screen');

	if (!document.webkitIsFullScreen) {
		left_panel.style.float = 'left';
		full_screen.src = 'img/fullscreen.png';
	} else {
		left_panel.style.float = 'none';
		full_screen.src = 'img/restore_screen.png';
	}

	onresize();
}

document.getElementById('left_panel').addEventListener(
		'webkitfullscreenchange', cancel_full_screen, false);
document.getElementById('full_screen').addEventListener('click',
		click_full_screen);

function testecho() {
	var flash = document.getElementById('RtmpLiveEncoder');
	flash.test_echo("testecho");
}
// document.getElementById('full_screen').addEventListener('click', testecho);

// /////////////////////////////////////////////////////////////////////////////
// pdf part
//

function renderPage(num) {
	pageRendering = true;

	pdfDoc.getPage(num).then(function(page) {
		var viewport = page.getViewport(scale);
		pdf_w = viewport.width;
		pdf_h = viewport.height;
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		var renderContext = {
			canvasContext : ctx,
			viewport : viewport
		};
		var renderTask = page.render(renderContext);

		renderTask.promise.then(function() {
			pageRendering = false;
			if (pageNumPending !== null) {
				renderPage(pageNumPending);
				pageNumPending = null;
			}
			ctx.strokeStyle = "red";
			ctx.lineWidth = 3;

		});
	});

	document.getElementById('page_num').textContent = num;
}

function queueRenderPage(num) {
	if (pageRendering) {
		pageNumPending = num;
	} else {
		renderPage(num);
	}
}

function onPrevPage() {
	if (pageNum <= 1) {
		return;
	}
	pageNum--;
	queueRenderPage(pageNum);
	if (global_info.role === 'teacher') {
		socket.emit('prev', {
			pageNum : pageNum
		});
	}
}

function onNextPage() {
	if (pageNum >= pdfDoc.numPages) {
		return;
	}
	pageNum++;
	queueRenderPage(pageNum);
	if (global_info.role === 'teacher') {
		socket.emit('next', {
			pageNum : pageNum
		});
	}
}

/**
 * Asynchronously downloads PDF.
 */
PDFJS.getDocument(pdf_url).then(function(pdfDoc_) {
	pdfDoc = pdfDoc_;
	document.getElementById('page_count').textContent = pdfDoc.numPages;
	renderPage(pageNum);

	document.getElementById('prev').addEventListener('click', onPrevPage);
	document.getElementById('next').addEventListener('click', onNextPage);
});

// /////////////////////////////////////////////////////////////////////////////
// login part
// 
var username;
var connected = false;
var pp = false;

var socket = io.connect(global_info.socketio_addr);

function set_user_name() {
	if (username) {
		if (global_info.role === 'teacher') {
			socket.emit('add user', {
				role : 'teacher',
				username : username
			});
		} else {
			socket.emit('add user', {
				role : 'student',
				username : username
			});
		}
	}
}

function add_user() {
	var username_ = global_info.userid;
	username = username_;
	set_user_name();
}

socket.on('connect', function() {
	console.log('connected');

	add_user();

	if (global_info.biz_type === 'live' || global_info.biz_type === 'record') {
		start_playlive();
	}
});

socket.on('login', function(data) {
	connected = true;
});

socket.on('user number change', function(data) {
	var numUsers = data.numUsers;
	console.log('user number change', data);
	document.getElementById('number_users').textContent = numUsers;
});

socket.on('new message', function(data) {
	console.log('new message');
	_displayNewMsg(data.username, data.message);
});

socket.on('prev', function(e) {
	console.log('prev', e.pageNum);
	var pageNum = e.pageNum;
	queueRenderPage(pageNum);
});

socket.on('next', function(e) {
	console.log('next', e.pageNum);
	var pageNum = e.pageNum;
	queueRenderPage(pageNum);
});

socket.on('mousedown', function(e) {
	console.log('mousedown');
	pp = true;
	var mouseX = e.mouseX;
	var mouseY = e.mouseY;
	ctx.moveTo(mouseX, mouseY);
});

socket.on('mouseup', function(e) {
	console.log('mouseup');
	pp = e.pp;
});

socket.on('mousemove', function(e) {
	console.log('mousemove');
	var mouseX = e.mouseX;
	var mouseY = e.mouseY;
	pp = e.pp;
	if (pp) {
		ctx.lineTo(mouseX, mouseY);
		ctx.stroke();
	}
});

// /////////////////////////////////////////////////////////////////////////////
// chat part
// 
document
		.getElementById('messageInput')
		.addEventListener(
				'keyup',
				function(e) {
					var messageInput = document.getElementById('messageInput'), msg = messageInput.value, color = '#000000';
					if (e.keyCode == 13 && msg.trim().length != 0) {
						messageInput.value = '';
						socket.emit('new message', msg);
						_displayNewMsg(global_info.userid, msg);
					}
					;
				}, false);

document.getElementById('clearBtn').addEventListener('click', function() {
	document.getElementById('historyMsg').innerHTML = '';
}, false);

document.getElementById('emoji').addEventListener('click', function(e) {
	var emojiwrapper = document.getElementById('emojiWrapper');
	if (emojiwrapper.style.display === 'block') {
		emojiwrapper.style.display = 'none';
	} else {
		emojiwrapper.style.display = 'block';
	}
	e.stopPropagation();
}, false);

document.body.addEventListener('click', function(e) {
	var emojiwrapper = document.getElementById('emojiWrapper');
	if (e.target != emojiwrapper) {
		emojiwrapper.style.display = 'none';
	}
});

document.getElementById('emojiWrapper').addEventListener(
		'click',
		function(e) {
			var target = e.target;
			if (target.nodeName.toLowerCase() == 'img') {
				var messageInput = document.getElementById('messageInput');
				messageInput.focus();
				messageInput.value = messageInput.value + '[emoji:'
						+ target.title + ']';
			}
		}, false);

function _initialEmoji() {
	var emojiContainer = document.getElementById('emojiWrapper'), docFragment = document
			.createDocumentFragment();
	for (var i = 69; i > 0; i--) {
		var emojiItem = document.createElement('img');
		emojiItem.src = './content/emoji/' + i + '.gif';
		emojiItem.title = i;
		docFragment.appendChild(emojiItem);
	}
	emojiContainer.appendChild(docFragment);
}

function _displayNewMsg(user, msg, color) {
	var container = document.getElementById('historyMsg'), msgToDisplay = document
			.createElement('p'), msg = _showEmoji(msg);
	msgToDisplay.style.color = color || '#000';
	msgToDisplay.innerHTML = user + ' : ' + msg;
	container.appendChild(msgToDisplay);
	container.scrollTop = container.scrollHeight;
}

function _showEmoji(msg) {
	var match, result = msg, reg = /\[emoji:\d+\]/g, emojiIndex, totalEmojiNum = document
			.getElementById('emojiWrapper').children.length;
	while (match = reg.exec(msg)) {
		emojiIndex = match[0].slice(7, -1);
		if (emojiIndex > totalEmojiNum) {
			result = result.replace(match[0], '[X]');
		} else {
			result = result.replace(match[0],
					'<img class="emoji" src="./content/emoji/' + emojiIndex
							+ '.gif" />');
		}
	}
	return result;
}

_initialEmoji();

// /////////////////////////////////////////////////////////////////////////////
// live part
// 
function play_live() {
	url = global_info.live_addr + '/' + global_info.course_id;
	console.log('play', url);

	$("#div_container").remove();

	var div_container = $("<div/>");
	$(div_container).attr("id", "div_container");
	$("#player").append(div_container);

	var player = $("<div/>");
	$(player).attr("id", "player_id");
	$(div_container).append(player);

	srs_player = new SrsPlayer("player_id", 1, 1);
	srs_player.on_player_ready = function() {
		this.play(url);
	};

	srs_player.start();
}

function stop_live() {
	if (srs_player) {
		srs_player.stop();
		srs_player = null;
	}
}

function start_playlive() {
	var course_id = global_info.course_id;

	play_live();

	socket.emit('start_playlive', {
		course_id : course_id
	});
}

function stop_playlive() {
	var course_id = global_info.course_id;

	stop_live();

	socket.emit('stop_playlive', {
		course_id : course_id
	});
}

// /////////////////////////////////////////////////////////////////////////////
// playback part
// 
function padding(number, length, prefix) {
	if (String(number).length >= length) {
		return String(number);
	}
	return padding(prefix + number, length, prefix);
}

function get_time_str(time) {
	var time_str = "";
	// hour
	time = time % (24 * 3600);
	time_str += padding(parseInt(time / 3600), 2, '0') + ":";
	// minute
	time = time % (3600);
	time_str += padding(parseInt(time / 60), 2, '0') + ":";
	// seconds
	time = time % (60);
	time_str += padding(parseInt(time), 2, '0');
	return time_str;
}

var is_pause = true;
var interval_handler = null;

var interval_function = function() {
	var current_time = Number(document.getElementById("video1").currentTime)
			.toFixed(1);
	var duration = Number(document.getElementById("video1").duration)
			.toFixed(1);
	var whiteboard_container = document.getElementById('whiteboard_container');
	document.getElementById("curr_pos").innerHTML = get_time_str(current_time);
	document.getElementById("seek_bar_2").style.left = current_time / duration
			* (whiteboard_container.clientWidth) + 'px';

	if (document.getElementById("video1").ended) {
		clearInterval(interval_handler);
		interval_handler = null;
		console.log('ended');

		document.getElementById("seek_bar_2").style.left = 0 + 'px';
		seek_bar_2.style.display = 'block';
		document.getElementById('play_pause').src = 'img/play.png';

		is_pause = true;
		is_start_playback = false;
	}
}

function play_pause() {
	var course_id = global_info.course_id;
	var play_pause = document.getElementById('play_pause');

	if (!is_pause) {
		play_pause.src = 'img/play.png';
		is_pause = true;
		socket.emit('pause_resume_playback', {
			is_pause : is_pause
		});
		document.getElementById("video1").pause();
	} else {

		play_pause.src = 'img/pause.png';
		is_pause = false;

		var seek_bar_ele = document.getElementById("seek_bar_2");
		var seek_bar_value = seek_bar_ele.style.left;
		console.log('seek_bar_left', seek_bar_value);
		if (seek_bar_value === '0px') {

			pageNum = 1;
			queueRenderPage(pageNum);

			/*
			 * var pos = 0; socket.emit('seek_playback', { pos : pos });
			 */
			document.getElementById("video1").src = global_info.playback_addr;
			document.getElementById("video1").pause();
			document.getElementById("video1").play();
			interval_handler = setInterval(interval_function, 1000);
		} else {
			socket.emit('pause_resume_playback', {
				is_pause : is_pause
			});
			document.getElementById("video1").play();
		}
	}
}

var is_start_playback = false;
document.getElementById("video1").addEventListener(
		"canplay",
		function() {
			document.getElementById("range").innerHTML = get_time_str(Math.round(document
					.getElementById("video1").duration));

			// var volume = document.getElementById('video1').volume;
			document.getElementById('video1').volume = playback_volume;

			var volume_bar_bg = document.getElementById('volume_bar_bg');
			var volume_bar_1 = document.getElementById('volume_bar_1');
			var volume_bar_2 = document.getElementById('volume_bar_2');
			volume_bar_1.style.width = volume_bar_bg.clientWidth
					* playback_volume + 'px';
			volume_bar_2.style.left = volume_bar_1.clientWidth - 5 + 'px';

			onActivityLevel(playback_volume * 100);

			if (!is_start_playback) {
				var total = (document.getElementById("video1").duration * 1000)
						.toFixed(0);
				socket.emit('start_playback', {
					course_id : global_info.course_id,
					total : total
				});
				is_start_playback = true;
			}
		});
document.getElementById('play_pause').addEventListener('click', play_pause);

// seek_bar seek
if (global_info.biz_type === 'playback' || global_info.biz_type === 'live'
		|| global_info.biz_type === 'record') {

	function seek_bar_mouse_down(e) {
		console.log(e);
		seek_bar_2.style.left = e.offsetX - 5 + 'px';
		seek_bar_2.style.display = 'block';
		send_seek(e.offsetX - 5);
	}

	function seek_bar_mouse_up(e) {
		console.log(e);
		seek_bar_2.style.display = 'block';
		seek_bar_2.style.left = e.offsetX - 5 + 'px';
	}

	function send_seek(e) {
		var curr_x = e;
		var total = document.getElementById("video1").duration;
		var bili = curr_x
				/ document.getElementById('whiteboard_container').clientWidth;
		var pos = (total * bili).toFixed(0);
		console.log('pos', pos);
		socket.emit('seek_playback', {
			pos : pos * 1000
		});
		document.getElementById("curr_pos").innerHTML = get_time_str(Number(pos));
		document.getElementById("video1").currentTime = pos;
	}

	document.getElementById('seek_bar_bg').addEventListener('mousedown',
			seek_bar_mouse_down);
	document.getElementById('seek_bar_bg').addEventListener('mouseup',
			seek_bar_mouse_up);
	document.getElementById('seek_bar_1').addEventListener('mousedown',
			seek_bar_mouse_down);
	document.getElementById('seek_bar_1').addEventListener('mouseup',
			seek_bar_mouse_up);

	function volume_bar_mouse_down(e) {
		console.log(e);
		volume_bar_2.style.left = e.offsetX - 5 + 'px';
		volume_bar_2.style.display = 'block';
		send_volume_seek(e.offsetX - 5);
	}

	function volume_bar_mouse_up(e) {
		console.log(e);
		volume_bar_2.style.display = 'block';
		volume_bar_2.style.left = e.offsetX - 5 + 'px';
	}

	function send_volume_seek(e) {
		var curr_x = e;
		document.getElementById("volume_bar_1").style.width = curr_x + 'px';

		var total = 1.0;
		var seek_bar_bg_w = document.getElementById('volume_bar_bg').clientWidth;
		var bili = Number((curr_x / seek_bar_bg_w).toFixed(1));
		var pos = Number((total * bili).toFixed(2));

		if (global_info.biz_type === 'record') {
			// var rtmpLiveEncoder = document.getElementById('RtmpLiveEncoder');
			// rtmpLiveEncoder.set_volume(pos);
		} else if (global_info.biz_type === 'playback') {
			var video = document.getElementById('video1');
			playback_volume = pos;
			video.volume = pos;
			onActivityLevel(pos * 100);
		} else if (global_info.biz_type === 'live') {
			var player_id = document.getElementById('player_id');
			player_id.set_volume(bili);
			// console.log(total, seek_bar_bg_w, curr_x, bili, pos);
			onActivityLevel(pos * 100);
		}

	}

	document.getElementById('volume_bar_bg').addEventListener('mousedown',
			volume_bar_mouse_down);
	document.getElementById('volume_bar_bg').addEventListener('mouseup',
			volume_bar_mouse_up);
	document.getElementById('volume_bar_1').addEventListener('mousedown',
			volume_bar_mouse_down);
	document.getElementById('volume_bar_1').addEventListener('mouseup',
			volume_bar_mouse_up);
}
// /////////////////////////////////////////////////////////////////////////////
// record part
// 

var is_record = false;

function start_record() {
	pageNum = 1;
	// renderPage(pageNum);
	console.log('start_record');
	// var course_id = parseInt(document.getElementById('course_id').value);
	var course_id = global_info.course_id;
	socket.emit('start_record', {
		record : true,
		course_id : course_id
	});
	socket.emit('next', {
		pageNum : pageNum
	});
}

function stop_record() {
	console.log('stop_record');

	if (socket) {
		socket.emit('stop_record', {
			record : false
		});
	}
}

function start_stop_record() {
	var start_stop_record = document.getElementById('start_stop_record');

	if (!is_record) {
		start_stop_record.src = 'img/stop_record.png';
		is_record = true;
		pageNum = 1;
		console.log('start_record');
		var course_id = global_info.course_id;
		socket.emit('start_record', {
			record : true,
			course_id : course_id
		});
		socket.emit('next', {
			pageNum : pageNum
		});
	} else {
		start_stop_record.src = 'img/start_record.png';
		is_record = false;
		console.log('stop_record');
		if (socket) {
			socket.emit('stop_record', {
				record : false
			});
		}
	}
}

document.getElementById('start_stop_record').addEventListener('click',
		start_stop_record);

var pp = false;

var interval_handler = null;
var mousemove_capture_flag = true;
var interval_function1 = function() {
	mousemove_capture_flag = true;
};

if (global_info.role === 'teacher') {
	canvas.addEventListener('mousedown', function(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		mouseX = mouseX * mouse_factor;
		mouseY = mouseY * mouse_factor;

		pp = true;
		ctx.moveTo(mouseX, mouseY);
		socket.emit('mousedown', {
			mouseX : mouseX,
			mouseY : mouseY
		});

		e.preventDefault();
		// start interval
		interval_handler = setInterval(interval_function1, 40);

	});

	canvas.addEventListener('mouseup', function(e) {
		pp = false;
		socket.emit('mouseup', {
			pp : false
		});

		clearInterval(interval_handler);
		interval_handler = null;
	});

	canvas.addEventListener('mousemove', function(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		mouseX = mouseX * mouse_factor;
		mouseY = mouseY * mouse_factor;
		if (pp == true && mousemove_capture_flag == true) {
			ctx.lineTo(mouseX, mouseY);
			socket.emit('mousemove', {
				mouseX : mouseX,
				mouseY : mouseY,
				pp : pp
			});
			ctx.stroke();

			mousemove_capture_flag = false;
		}
	});

}
