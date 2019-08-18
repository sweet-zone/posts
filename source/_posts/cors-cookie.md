---
layout: post
title: 跨域读写 Cookie
banner: assets/img/cookie.jpeg
tags:
- JavaScript
- XHR
---

因为 CORS（HTTP访问控制）的出现，跨域请求变的简单了很多，只需要服务器设置几个 response header 就可以轻松实现跨域访问。

```js
// nodejs express 简单实现
app.get('/cors_url', function(req, res) {
    res.set({
        'Access-Control-Allow-Origin': 'http://admin.ts.163.com:8184',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
    })

    res.json({
        code: 200,
        msg: 'hello'
    })
})
```

在这样设置之后，请求可以正常发出和响应，但你会发现，此时并没有带上服务器域名下的 cookie。比如，在你使用网易邮箱登录了之后，你的浏览器中就会出现 domain 为 `.163.com` 的 cookie。如果我们在另一个域名（比如 my.com）调用了 x1.163.com 域名下的接口，此时 request header 并不会带上 `.163.com` cookie。

CORS 是可以做到这一点的，前后端进行相应的设置后，就可以发送 cookie。

首先 ajax 中，在 send 方法前，设置 `xhr.withCredentials = true`，就可以向服务器发送 cookie。这时候如果发起请求，会得到一个错误：

> XMLHttpRequest cannot load http://x1.163.com:9003/cors_url?id=123456. The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'. Origin 'http://you.com:9005' is therefore not allowed access. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.

服务器也要进行相应的设置：

```js
// nodejs express 简单实现
app.get('/cors_url', function(req, res) {
    res.set({
        'Access-Control-Allow-Origin': 'http://admin.ts.163.com:8184',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': true // 增加 Access-Control-Allow-Credentials 
    })

    res.json({
        code: 200,
        msg: 'hello'
    })
})
```


此时发送请求， request header 多了 cookie 这个字段，同时服务器响应头中也可以通过 Set-Cookie 设置服务器域名下的 cookie。

![cors-header](/posts/assets/img/cors/header.jpg)

对于 IE8 和 IE9，浏览器提供了 `window.XDomainRequest` 对象，方法和 XMLHttpRequest 类似。

参考：

* [HTTP访问控制（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#附带身份凭证的请求)
* [跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)
* [XDomainRequest object](https://msdn.microsoft.com/en-us/library/cc288060%28VS.85%29.aspx)









