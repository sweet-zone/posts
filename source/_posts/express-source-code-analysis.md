---
layout: post
title: Express 源码简析
banner: assets/img/express-source-code.jpeg
date: 2017-9-13 23:04
updated: 0
tags: nodejs
---

[Express](https://github.com/expressjs/express) 是一个简洁易用的 Nodejs 的 Web 开发框架，我的个人项目：[基于Gulp构建前端Mock Server](https://github.com/zjzhome/Gulp-Mock-Server)中，前端服务器就是使用了 Express 来实现。

使用 Express 创建 Web应用及其简单，可以直接使用 express-generator 创建一个脚手架，也可以最简单的一个 app.js 搞定，下面是一个简单的 Express 创建服务器的示例：

```js
var express = require('express')
var app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

// 可以定制多种路由
app.get('/api', function(req, res) {
    res.send('Hello world')
})

// 也可以这样定义嵌套路由
// express-generator 自动生成的代码就是采用了这样的方法
var users = require('./routes/users');
app.use('/users', users);

app.listen(3000)
```

./routes/users.js 内容如下：
```js
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
```

运行 `node app.js`, 访问 `localhost:3000/api` 页面会输出 `Hello world`，从上面可以看出，创建 express 大概需要这么几步：

* 设置应用，比如设置要使用的模板引擎，设置模板目录
* app.use 设置页面请求中要使用到的中间件
* 设置路由监听
* 开启服务器，监听响应端口

我们对照这四个步骤来看下 Express 的源码。

## 初始化和设置应用

下载 express 4.x 源码，首先找到 express 的入口文件 `index.js`，只有一行：

```js
module.exports = require('./lib/express');
```

然后进入 `lib` 目录，其实 express 所有的代码都在 `lib` 目录下。找到 express.js ：

```js
var proto = require('./application');

exports = module.exports = createApplication;

function createApplication() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  // 继承 EventEmitter，使得 app 也能触发和监听事件
  mixin(app, EventEmitter.prototype, false);
  // app 增加方法，该方法来自于 application.js
  // 其中就有 app.init
  mixin(app, proto, false);

  // expose the prototype that will get set on requests
  // 暴露 request 属性
  app.request = Object.create(req, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  // expose the prototype that will get set on responses
  // 暴露 response 属性
  app.response = Object.create(res, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  app.init();
  return app;
}
```

以上代码就是应用初始化的主要代码，当 `app = require('express')()`，也就是执行了 `createApplication` 方法，该方法返回了 `app` 实例。改方法对 `app` 做了相关处理，相关处理标注在了代码中。最后调用 `app.init` 进行应用设置，init 相关代码在 `application.js` 内，太长就不贴了。

同时我们发现 app 其实是一个方法，这个方法拥有 `req`、`res`、`next`三个参数。当我们调用 `app.listen(3000)` 开启服务器监听端口时，其实是执行了一下代码：

```js
// 代码来自 application.js
app.listen = function listen() {
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

// 其实也就是以下代码
app.listen = function listen() {
  var server = http.createServer(function(req, res, next) {
    app.handle(req, res, next)
  });
  return server.listen.apply(server, arguments);
};
```

我们看到 app 是作为 `http.createServer` 这个方法的参数传进去的，app 方法的前两个参数和 `http.createServer` 前两个参数一致，当用户访问某个链接时，就执行 `app.handle`，处理该路由对应的方法，该方法将在最后介绍。

## 中间件处理

使用中间件均是通过 app.use 方法，该方法位于 `./application.js`。

```js
app.use = function use(fn) {
  var offset = 0;
  var path = '/';

  // default path to '/'
  // disambiguate app.use([fn])
  if (typeof fn !== 'function') {
    var arg = fn;

    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }

    // first arg is the path
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }

  var fns = flatten(slice.call(arguments, offset));

  if (fns.length === 0) {
    throw new TypeError('app.use() requires middleware functions');
  }

  // 以上代码对方法参数进行处理，如果第一个参数没有指定路由，则默认为'/'
  // 然后得到路由或者中间件的处理方法，交由下面的代码处理。

  // setup router
  // 路由初始化
  this.lazyrouter();
  var router = this._router;

  fns.forEach(function (fn) {
    // non-express app
    // 如果fn为简单方法，直接使用 router.use('/', fn)
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn);
    }

    debug('.use app under %s', path);
    fn.mountpath = path;
    fn.parent = this;

    // restore .app property on req and res
    // 如果 fn 是有 handle 方法，则执行下面的逻辑
    // 这种就对应使用 app.use 来定义路由的方式，app.use第一个参数是路由，第二个参数就是 router，router和 app 都有 handle、use等方法。
    router.use(path, function mounted_app(req, res, next) {
      var orig = req.app;
      fn.handle(req, res, function (err) {
        setPrototypeOf(req, orig.request)
        setPrototypeOf(res, orig.response)
        next(err);
      });
    });

    // mounted an app
    fn.emit('mount', this);
  }, this);

  return this;
};
```

## 路由监听

从上面我们可以看到，app.use 最终都指向了 router.use 或者 router.handle 方法，那就让我们进入 router 的源码一探究竟。router 的源码都在 `./lib/router` 目录下。

router 的入口是 index.js，首先入口处定义了 router，定义的方式类似 app 这里就不再贴源码了。下面看一下，router 中被使用的 use 方法。

router.use 处理方法和 app.use 类似，首先对方法参数做处理。把不一样的部分贴到下面：

```js
var layer = new Layer(path, {
  sensitive: this.caseSensitive,
  strict: false,
  end: false
}, fn);

layer.route = undefined;

this.stack.push(layer);
```

首先得到一个 Layer 实例，并且 push 到 this.stack。

Layer 相关的代码在 layer.js 内，Layer 内定义单个路由处理的相关方法，包括路由是否匹配、处理路由逻辑、错误处理等。在接下来要说到的处理请求会用到，处理请求，主要是 router.handle 方法，在上面提到的 app.handle 最终也是调用了 router.handle 方法。

## 处理请求

router.handle 方法很长。主要功能是遍历 router.stack 内存储的所有路由及其对应的方法，即 layer, 如果匹配到当前用户访问的路由，就通过执行 layer.handle_request 执行路由对应的方法。

这些路由处理的方法要么是通过 app[method] 定义要么是通过 router[mothod] 定义，这里的 method 是 get、post 这个 HTTP 动词。这些方法定义在 Route 对象下，源代码位于 `./lib/router/route.js` 内。

```js
// methods 是服务器支持的所有 http 动词
// 这些方法也被代理到 app 和 router 上，所以 app 和 router 能够直接调用
methods.forEach(function(method){
  Route.prototype[method] = function(){
    var handles = flatten(slice.call(arguments));

    for (var i = 0; i < handles.length; i++) {
      var handle = handles[i];

      if (typeof handle !== 'function') {
        var type = toString.call(handle);
        var msg = 'Route.' + method + '() requires callback functions but got a ' + type;
        throw new Error(msg);
      }

      debug('%s %o', method, this.path)

      // router.get('/', function(req, res, next) {
      //   res.send('respond with a resource');
      // });
      var layer = Layer('/', {}, handle);
      layer.method = method;

      this.methods[method] = true;
      this.stack.push(layer);
    }

    return this;
  };
});
```

当直接调用 app.get 等方法时，其实是执行了以下的语句：

```js
var route = this._router.route(path);
route[method].apply(route, slice.call(arguments, 1));
```

在执行对应的 route.get 之前，先执行了 router.route:

```js
proto.route = function route(path) {
  var route = new Route(path);

  var layer = new Layer(path, {
    sensitive: this.caseSensitive,
    strict: this.strict,
    end: true
  }, route.dispatch.bind(route));

  layer.route = route;

  this.stack.push(layer);
  return route;
};
```

我们看到 Layer 的第三个参数是 route.dispatch，这个方法处理方式类似前面提到的 router.handle，最终都是通过layer 找到匹配的路由并且执行相应的方法。

所以 Layer 可以看做是一个中间层，起到了承上启下的作用。每个 layer 实例存储一个路由方法，以及这个路由方法对应的路由。当调用 route.dispatch 或者 router.handle 等方法的时候，都要过一遍这个中间层，筛选出用户当前访问的路由，然后做出处理。













