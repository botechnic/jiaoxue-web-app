# jiaoxue-web-app

jiaoxue web app

## How to use

```
$ git clone https://github.com/botechnic/jiaoxue-web-app.git
$ cd jiaoxue-web-app
$ node app.js
```

* And point your browser to `http://localhost:8989/jiaoxue/teacher.html` for teacher. 
* And point your browser to `http://localhost:8989/jiaoxue/live.html` for student live. 
* And point your browser to `http://localhost:8989/jiaoxue/playback.html` for student playback. 

## 配置说明
* course_id: 课程id
* role：
"student" 学生
"teacher" 老师
* biz_type:
"record" 老师上课时
"live" 学生直播课
"playback" 学生回放课
* pdf_addr：课件地址
* live_addr: 学生收听地址
* publish_addr: 老师发布地址
* playback_addr: 学生回放地址
* socketio_addr: 信令地址

## 限制
* 只支持宽比高大的pdf
* pdf资源不支持跨域
