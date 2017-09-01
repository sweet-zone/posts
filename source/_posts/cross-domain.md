
layout: post
title: 关于跨域
banner: assets/img/cross-domain.jpg
tags: 
- JavaScript
- XHR
---

跨域在 Web 开发中很常见，但浏览器并不想让你方便的跨域，必须要满足一定条件才可以。网上挺多的文章说这个事，有些文章讲的比较全面比较细致，比如[JavaScript跨域总结与解决办法](http://www.cnblogs.com/rainman/archive/2011/02/20/1959325.html)。本文呢不再去一一详述，只讲述自己工作中涉及到的以及自己的一些看法。

## JSONP

jQuery 让很多的初学者（包括当年的我）以为 jsonp 是 ajax 的一种。jsonp 其实是利用了 JS 资源可以跨域的特性（和利用 `img.src` 类似）。

前端动态创建 script 标签，发起一个 get 请求，和服务端约定好 callback 参数就是一个全局方法。当结果返回之后，就会执行这个全局方法，这里是 `jsonpCallback`。

```js
function jsonpCallback(data) {
    console.log(data)
}

var script = document.createElement('script')
script.src = 'http://localhost:9003/jsonp?callback=jsonpCallback'
document.body.appendChild(script)
```

服务端代码：

```js
app.get('/jsonp', function(req, res) {
    var callback = req.query.callback
    res.send(callback + '(' + JSON.stringify({
        code: 200,
        msg: 'hello'
    }) + ')')
})
```

jsonp 好处是支持性特别好，但只支持 get 请求。不过都到现在这个时代了，肯定要用 CORS 了。

## HTTP访问控制(CORS)

这个是从服务端控制可以跨域访问的域名，更加灵活。

```js
app.get('/cors_url', function(req, res) {

    res.set({
        'Access-Control-Allow-Origin': 'http://you.com:9005',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': true
    })

    res.json({
        code: 200,
        msg: 'hello'
    })
})
```

并且还可以附带身份信息 cookies，更多可以看之前的文章：[跨域读写 Cookie](/2017/06/03/cors-cookie.html)。

## iframe

iframe 作为前端唯一可以加载外部网页的标签，在跨域界有着不可取代的作用。

### 根命名相同，子域名不同

这时候需要设置父子页面的 document.domain 为统一根域名即可

```js
document.domain = 'rootDomain'
```

### 跨域读写存储

比如 a.com 有些数据 sessionStorage 中，而这些数据在 a.com.hk 中使用，这时候需要 a.com 写入到 sessionStorage 后，把数据也写入到 b.com 的 sessionStorage 中。很明显 a.com 下不能直接写，这时候在 a.com 前一个 b.com 的 iframe，a.com 和 b.com 互相通知即可。

互相通知直接使用 `window.postMessage`，IE8+都是支持的。

```js
// a.com
// <iframe src="http://b.com/static/b.html"></iframe>
// 向 iframe 发送消息
window.onload = function() {
    // 切记要在 onload 之后
    window.frames[0].postMessage('hello2', 'http://b.com');
}

// 接收 iframe 消息
window.addEventListener('message', function(evt) {
    sessionStorage.setItem('cors', evt.data)
}, false);

// ------------------

// b.com
// 接收消息
window.addEventListener('message', function(evt) {
    sessionStorage.setItem('cors', evt.data)
}, false);

// 向父窗口发送消息
window.onload = function() {
    parent.postMessage('hello1', 'http://a.com')
}
```

## 总结

对于异步请求，坚决的拥抱 CORS。跨域消息传输坚决的拥抱 postMessage。iframe 这个古老的标签依然充满力量。










