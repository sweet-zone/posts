
layout: post
title: setImmediate() vs nextTick() vs setTimeout(fn,0) 
banner: assets/img/javascript-this.jpeg
label: 译
tags:
- nodejs
---

几天前，我给几个 nodejs 新手培训异步编程相关的内容，我们讨论了 nodejs 中的异步 api。我想给他们提供一些文章并且 google 了一些；但是令人惊诧的是，大多数文章关于 `setImmediate()` 或者 `process.nextTick()` 的讲解都不够充分，而且存在误导。但是直接读 nodejs 官网文档，对于一般工程师来说不太可行。所以我就决定写这么一篇文章。

## 了解下错误概念先

在我开始讲解之前，我先澄清下其他文章里的一些错误观点，如果你有没有被误导过，你可以跳过这一段。

### **`setImmediate()` 在 `setTimeout(fn, 0)` 之前执行**

这是最常见一个误解。稍后我会讲解正确的概念，下面是一系列错误的证据：

```js
//index.js
setTimeout(function(){
    console.log("SETTIMEOUT");
});
setImmediate(function(){
    console.log("SETIMMEDIATE");
});
 
//run it
node index.js
```

如果 `setImmediate()` 在 `setTimeout(fn, 0)` 之前执行是正确的，运行上述代码的结果应该是：`SETIMMEDIATE` 一直在 `SETTIMEOUT` 在之前打印。然而事实是，`SETIMMEDIATE` 和 `SETTIMEOUT` 的输出顺序是不可预料的，多运行几次 `node index.js`，会出现不同的结果。

### **`setImmediate()` 会将回调函数放在执行队列头部**

```js
//index.js
setTimeout(function() {
    console.log("TIMEOUT 1");
    setImmediate(function() {
        console.log("SETIMMEDIATE 1");
    });
}, 0);
setTimeout(function() {
    console.log("TIMEOUT 2");
    setImmediate(function() {
        console.log("SETIMMEDIATE 2");
    });
}, 0);
setTimeout(function() {
    console.log("TIMEOUT 3");
}, 0);

//run it
node index.js
```

如果上述论断正确，执行代码应该输出：

```js
TIMEOUT 1
SETIMMEDIATE 1
TIMEOUT 2
SETIMMEDIATE 2
TIMEOUT 3
```

但是真实的输出却是像下面这样，不论运行多少次：

```js
TIMEOUT 1
TIMEOUT 2
TIMEOUT 3
SETIMMEDIATE 1
SETIMMEDIATE 2
```

译者注：

在运行上述代码时，第一次运行出现的结果并不像原文作者说的那样，再之后的运行都是像作者说的那样。

```js
TIMEOUT 1
SETIMMEDIATE 1
TIMEOUT 2
TIMEOUT 3
SETIMMEDIATE 2
```

### **nextTick() 的回调函数在下一次事件循环执行**

事实上，`process.nextTick()` 和 `setImmediate()` 都起错名字了。如果两者名字交换，才更符合各自的功能。然而 JavaScript，他们没有放弃或改变 API 命名，所以命名持续错误。从功能上来讲，`process.nextTick()` 才会立即调用回调函数。`setImmediate()` 在下次事件循环中触发回调。

## node.js 事件循环如何工作

要理解这三个函数的区别和工作流程，唯一方法就是理解事件循环的功能。希望你已经理解事件循环用来处理回调，在这里我们讨论它如何工作的。

虽然下面会对事件循环做简单的解释，但如果你要了解的更详细，请阅读：[in depth explanation of event loop structure and workflow](http://voidcanvas.com/nodejs-event-loop/)。

![img](http://voidcanvas.com/wp-content/uploads/2017/02/event-loop.png)

图里每一个矩形框，从 `Timers` 到 `close callbacks` 都代表了事件循环的一个阶段。图中间有一个 `nextTickQueue`，但它不是事件循环的一部分。每个阶段都有一个相关联的队列。当事件循环进入特定的阶段，它的任务就是执行这些队列中的回调或任务。下面是对这些阶段的描述：

**Timer：** 在指定的时间阈值后处理 `setTimeout` 和 `setInterval` 指定的回调。
**I/O callbacks：** 处理所有除 `setTimeout`、`setInterval`和`setImmediate` 指定的回调，但不会处理 close 事件的回调。（译者注：上一轮循环中有少数的I/Ocallback会被延迟到这一轮的这一阶段执行）
**Idle, prepare：** 仅内部使用
**Pole：** 检索新的 I/O 事件。nodejs最为重要的一环。
**Check：** 处理 `setImmediate` 指定的回调。
**Close callbacks：** 指定 close 事件的回调等。（比如 socket 的关闭事件）
**nextTickQueue：** 存储 `process.nextTick()` 的回调，但不是事件循环的一部分。

## 事件循环流程

首先进入 `Timer` 阶段，检查定时器队列中是否有回调，如果有，就开始一个接一个的执行，直到队列为空或者执行最大允许数量的回调。

接下来进入 `I/O callback` 阶段，再次找到与它相关联的队列，用于i/o操作。和上一个阶段的执行方法类似，任务完成后，进入下一个阶段。

`Idle` 阶段为 node 内部使用，主要做一些准备工作。在这之后，事件循环进入`Poll` 阶段，这个阶段主要进行事件处理，如果此时没有事件待处理，事件循环会在 `Poll` 阶段等待一段时间，检索新的 I/O 事件，在等待的时候事件循环什么都不会做。但是，如果此时有 `setImmediate` 指定的回调，事件循环会终止 `Poll` 阶段进入 `Check` 阶段来执行这些回调。

`Check` 阶段之后，尝试执行 `Close callbacks` 中的任何脚本，在这之后，会继续回到 `Timer` 阶段，开始下一轮的循环。

关于 `nextTickQueue`，任何 `process.nextTick() ` 指定的回调都位于 `nextTickQueue` 队列里，不论位于哪一个阶段，事件循环在执行完当前阶段的任务后，都会一个接一个的执行它们，直到所有队列执行完毕。

讲解完事件循环后，我们尝试理解下本文中提到的三个 API。

## setImmediate()

首先，基于事件循环的流程，我们可以看到 `setImmediate()` 并不是立即执行的。但包含`setImmediate()` 回调的队列，会在每一个循环中一次性执行完毕。（`Check` 阶段）。

所以，文中上面的代码示例：

```js
setTimeout(function(){
    console.log("SETTIMEOUT");
});
setImmediate(function(){
    console.log("SETIMMEDIATE");
});
```

执行结果是不可预料的，这取决于进程的性能。这是因为定时器还有额外的排序工作，还需要一个额外的时间来注册它。但是，如果我们移动代码到一个 I/O 回调中，不论什么情况，我们可以保证 setImmediate 的回调会先于 setTimeout 执行。

```js
//index.js
var fs = require('fs');
fs.readFile("my-file-path.txt", function() {
    setTimeout(function(){
        console.log("SETTIMEOUT");
    });
    setImmediate(function(){
        console.log("SETIMMEDIATE");
    });
});

//run it
node index.js

//output (always)
SETIMMEDIATE
SETTIMEOUT
```

## setTimeout(fn,0)

setTimeout的回调在事件循环进入 `Timer` 阶段之前不会去执行，所以在 `Close callback` 阶段，任意同时出现的 `setTimeout(fn, 0)` 和 `setImmediate()` ，都能保证 setTimeout 0 先于 setImmediate 执行。时刻牢记上面的事件循环图，可以很容易的确定`setTimeout(fn, 0)` 和 `setImmediate()`到底哪个先执行。

## process.nextTick()

如 nodejs 文档所述：

> 不论当前处于事件循环哪个阶段，nextTickQueue 都在会在当前操作完成前执行。

也就是说，不论何时 JavaScript 和 C++ 通信，这个队列就会执行。因此，它不会只在当前阶段的任务完成之后调用，也不意味着在执行完当前回调之后调用，而是在直到下一个阶段到来之前的某个时候调用。

---

译者注：

虽然已经有很多文章在讲解 nodejs 事件循环的模型，但总是搬运来搬运去，不够系统，所以在翻译此文的过程进行学习。

不过这种知识点，实在是乏味，说白了只是一种实现，而且 nodejs 和浏览器的还不尽相同，最终沦为面试题的一环，就像有的作者说的那样，了解这些不如花时间了解下计算机原理、数据库等通用知识。

原文地址：[setImmediate() vs nextTick() vs setTimeout(fn,0) – in depth explanation](http://voidcanvas.com/setimmediate-vs-nexttick-vs-settimeout/)











