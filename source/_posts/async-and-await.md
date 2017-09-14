
layout: post
title: async & await
banner: assets/img/webpack.jpg
date: 2017-9-13 19:27
label: 译
tags:
- ES6
---

[JavaScript Promises](https://davidwalsh.name/promises)的出现，让我们可以走出回调地狱，着实惊艳。Promises 允许我们更好的引入和处理异步任务，虽然如此，但引入好多的 `then` 还是会让代码变的混乱。我已经开始使用 ES2017 里的 `async` 和 `await` 关键字来简化 promises 的处理。让我们一睹 `async` 和 `await` 的风采！

## 快速入门

* `async` 是函数声明的关键字
* `await` 用于 promises 处理过程中
* `await` 必须用在 `async` 声明的函数内部，虽然 Chrome 已经支持“顶级的”的 `await`
* `async` 函数返回 promises 对象，不关心函数的返回值是什么
* `async/await` 和 promises 的底层实现是一样的
* 大多数浏览器和 Nodejs 已经可用

## `async` 和 `await` 的好处

* 代码更加清晰简洁
* 更少的回调，调试更加简单
* 容易从 promises 中的 `then / catch` 转换
* 代码看起来自上而下，更少的缩进。

## `async` 和 `await` 简介

从实例入手要更简单，我们先来看一个简单的 `async/await` 的使用方法：

```js
// 使用 async 定义函数，然后 await 才能使用
async function fetchContent() {
  // Instead of using fetch().then, use await
  let content = await fetch('/');
  let text = await content.text();
  
  // async 函数内，text 是响应值
  console.log(text);

  // Resolve this async function with the text
  return text;
}

// Use the async function
var promise = fetchContent().then(...);
```

首先使用 `async` 声明函数；声明之后，`await` 可以用在该函数内部。`await` 关键字后面跟 promise：[`fetch API`](https://davidwalsh.name/fetch)。异步任务（在这个例子是 `fetch`）执行之后，一直在执行完成才继续下一个任务（并没有产生阻塞）。最后这个函数处理了返回值并且返回了一个 promises 对象。

代码自上而下，告别回调，异步处理变的更加简单！

## 转换 Promise 为 `await`

当时间允许，你一定很想将你的 promise 的代码升级到 `await`，让我们看下该怎么做：

```js
// Before: callback city!
fetch('/users.json')
  .then(response => response.json())
  .then(json => {
    console.log(json);
  })
  .catch(e => { console.log('error!'); })

// After: no more callbacks!
async function getJson() {
  try {
    let response = await fetch('/users.json');
    let json = await response.json();
    console.log(json);
  }
  catch(e) {
    console.log('Error!', e);
  }
}
```

从使用多个 `then` 到 `await` 十分简单，但你的代码的维护性变得很高。

## `async` / `await` 模式

声明 `async` 函数有以下方式：

### 匿名 Async 函数

```js
let main = (async function() {
  let value = await fetch('/');
})();
```

### Async 函数声明

```js
async function main() {
  let value = await fetch('/');
};
```

### Async 函数赋值

```js
let main = async function() {
  let value = await fetch('/');
};

// Arrow functions too!
let main = async () => {
  let value = await fetch('/');
};
```

### Async 函数作为参数

```js
document.body.addEventListener('click', async function() {
  let value = await fetch('/');
});
```

### 对象和类方法

```js
// Object property
let obj = {
  async method() {
    let value = await fetch('/');
  }
};

// Class methods
class MyClass {
  async myMethod() {
    let value = await fetch('/');
  }
}
```

正如你看到的，增加 `async` 函数十分简单，而且能很好的适用各种函数创建的流程。

## 错误处理

传统的 promises 允许使用 `catch` 回调处理 rejection，当你使用 `await`，最好使用 `try/catch`：

```js
try {
  let x = await myAsyncFunction();
}
catch(e) {
 // Error!
}
```

老式的 `try/catch` 不如 promises 的 `catch` 优雅，但在这里，它很给力！

## 并行

Google 的Jake Archibald在[Async functions document](https://developers.google.com/web/fundamentals/getting-started/primers/async-functions)中提出了一个完美的观点：不要用 `await` 使得任务变的太序列化。也就是说对于可以同时执行的任务，先触发任务然后再使用 `await`，而不是直接使用 `await` 使得任务像堆栈式一样的存储。

```js
// Will take 1000ms total!
async function series() {
  await wait(500);
  await wait(500);
  return "done!";
}

// Would take only 500ms total!
async function parallel() {
  const wait1 = wait(500);
  const wait2 = wait(500);
  await wait1;
  await wait2;
  return "done!";
}
```


第一个代码块反面例子，第二个 `await` 需要等待第一个 `await` 执行完毕后才执行，第二个代码块是一个更好的方法，同时触发了两个任务，然后才使用 `await`；这样做可以使得多个异步操作同时执行！

## `Promise.all` 等价方式

Primises API 中我最爱的 API 之一就是 `Promise.all`：当多有任务完成后才会触发回调。`async / await` 中没有等价的操作，但是[这篇文章](https://medium.com/@bluepnume/learn-about-promises-before-you-start-using-async-await-eb148164a9c8)提供了一个很好的解决方案：

```js
let [foo, bar] = await Promise.all([getFoo(), getBar()]);
```

请记住，`async / await`和 promises 在底层实现上是一致的，所以我们可以简单的等待（await）所有的 promises 任务结束!

现在大多数浏览器都可以使用 `async` 和 `await`，Nodejs 一样可用，老版本的Nodejs可以使用 [transform-async-to-generator](https://babeljs.io/docs/plugins/transform-async-to-generator/) 这个 babel 插件来使用 `async` 和 `await`。Promises 依然很棒，但 `async` 和 `await` 使得它可维护性更好。













