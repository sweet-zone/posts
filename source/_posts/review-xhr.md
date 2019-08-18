---
layout: post
title:  重温 XHR
banner: assets/img/ajax.jpg
date: 2017-6-6
tags: 
- JavaScript
- xhr
---

前端几乎所有的业务都离不开 Ajax，页面上 `$.ajax`、`axios` 满天飞，恐怕好久没有好好的认识 XMLHttpRequest 这个对象了。XMLHttpRequest 也已经有了好多改变，本文重新认识一下这个老朋友。

## XHR 流程梳理

* 首先初始初始化 XMLHttpRequest `var xhr = new XMLHttpRequest()`，在其他操作之前，即可监听 xhr 的状态变化事件。

```js
xhr.onreadystatechange = function() { /* 状态变化事件 */ }
```

* 调用 open 方法，初始化请求

```js
// 请求方法，请求地址，是否异步，用户名（可选），密码（可选）
xhr.open(method, url, async, user, password)
```

在调用 open 方法之后，可以重写由服务器返回的MIME type，
```js
// 以前使用 xhr 提取图片常见方法
xhr.overrideMimeType('text/plain; charset=x-user-defined')
```

* 修改请求头，发送请求之前可以设置请求的头部

```js
xhr.setRequestHeader(headerName, headerValue)
```

* 指定响应格式（xhr2）

以前 xhr 的响应体，只有xhr.responseText 和 xhr.responseXML，responseXML真的很少用，几乎都是 responseText，JSON.parse 之后用， xhr2 提供了设置响应格式的方法：

```js
// arraybuffer
// blob
// document
// json
xhr.responseType = 'text'(默认)
```

设置之后，可以从 `xhr.response` 取得响应结果，`xhr.response` 的格式就是指定的格式。

* 发送请求

```js
// 要发送的数据
// xhr.sendAsBinary() [已经废弃](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/sendAsBinary)
// 
xhr.send()
xhr.send(ArrayBuffer data)
xhr.send(Blob data)
xhr.send(Document data)
xhr.send(DOMString? data)
xhr.send(FormData data)
// 发送后，可能abort
xhr.abort()
```

* 处理响应结果

xhr1 中通过监听 onreadystatechange 事件

```js
xhr.onreadystatechange = function() {
    if(xhr.readyState == 4) {
        if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            // 请求成功
            handleResponse(xhr.responseText) // 或者 xhr.responseXML
        } else {
            // 请求失败
        }
    } 
}
```

xhr2 增加了几个新的事件，监听 xhr 的进度。

```js
xhr.onprogress = function() {}
xhr.onload = function() {}
xhr.onerror = function() {}
xhr.abort = function() {}
```

同事也可以监听上传事件

```js
xhr.upload.onprogress = function() {}
```

## 实例

从实际触发看一些实例。

### 简单xhr2 请求

重点关注不同的请求头对请求的影响。推荐 [四种常见的 POST 提交数据方式](四种常见的 POST 提交数据方式)

```js

var xhr = new XMLHttpRequest()

xhr.onprogress = function(e) { 
    console.log('进度：' + e.loaded / e.total)
}
xhr.onload = function() {
    // 请求结束
    if(xhr.status == 200) {
        console.log(xhr.response)
    } else {
        // handle error
    }
}
xhr.onerror = function(err) {
    // 不知道何时触发
}
xhr.abort = function() {
    console.log('abort')
}

// express 服务器为例
// req.query = { x: HHH }
xhr.open('post', '/xhr2-post?' + 'x=' + encodeURIComponent('HHH'), true) 
xhr.responseType = 'json'

// post 请求默认请求头为 application/x-www-form-urlencoded
// req.body = { z: 123 }
// 此时如果传入JSON.stringify({ y: 123 })，req.body = { '{y:123}': '' }
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
xhr.send('z=' + encodeURIComponent('123'))

// application/json 请求头
// req.body = { y: 123 }
// 如果此时 send 参数传入 y=123, 得到400错误
xhr.setRequestHeader('Content-Type', 'application/json')
xhr.send(JSON.stringify({
    y: 123
}))

xhr.abort() // 会触发 abort 事件
```

### iframe 上传

xhr2 之前，如果要实现无刷新上传只能借助于 iframe，因为 form 表单只能同步提交。上传进度也一般依赖于轮询。

iframe 上传就是将 form 表单提交到 iframe 里，在 iframe 里得到服务端返回的数据，形成一种未刷新的假象。

```html
<!--
target 设置为 iframe 的 name
-->
<form id="form" action="/upload" target="frame" method="post" enctype="multipart/form-data">
    <input type="file" id="file" name="file" /> <br />
    <input type="submit" value="上传" />
</form>

<iframe id="uploadFrame" name="frame" style="display:none;"></iframe>
```

```js
window.uploadCallback = function(data) {
    console.log(data)
}

var form = document.getElementById('form')
var frame = document.getElementById('uploadFrame')
form.onsubmit = function(e) {
    frame.src = form.action

    frame.onload = function() {
        var db = frame.contentDocument.body
        var txt = db.textContent
        parent.uploadCallback(JSON.parse(txt))
    }
}   
```

```js
// 服务器返回一段 js
// express multer 代码
app.post('/upload', upload.single('file'), function(req, res) {
    res.json({
        code: 200,
        body: req.file
    })
})
```

### HTML5 文件上传

XHR2 出现之后，异步上传文件变的简单的多。

form 表单和上面一样，target 属性去掉。

```js
form.onsubmit = function(e) {
    e.preventDefault()

    // formData 提交
    var formData = new FormData(form)

    var xhr = new XMLHttpRequest()
    xhr.open('POST', form.action, true)
    xhr.responseType = 'json'

    xhr.onload = function() { 
        if(xhr.status == 200) {
            console.log(xhr.response)
        }
    }

    // 监听上传进度
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            console.log(e.loaded / e.total)
        } 
    }

    xhr.send(formData)
}
```

## 总结

重新梳理了下 XHR 的相关知识，清晰了许多。如果需要兼容 IE8 等浏览器，如果加上跨域和 jsonp，就是一个完整的 ajax 库了。比如 [NEJ 的 Ajax 模块](https://github.com/genify/nej/blob/master/doc/AJAX.md)。













