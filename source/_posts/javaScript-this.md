---
layout: post
title: JavaScript 中的 this
banner: assets/img/javascript-this.jpeg
date: 2017-9-21 20:04
tags:
- javascript
---

JavaScript中 的 this 是一个很神奇的存在，要确定 this 到底指向的谁并不简单，最近拜读了你不知道的 JavaScript，书中完整了讨论了各种情况。

**this** 是在运行时进行绑定的，并不是在编写时绑定，它的上下文取决于函数调用时的各种条件。**this** 的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式。

当一个函数被调用时，会创建一个活动记录(有时候也称为执行上下文)。这个记录会包含函数在哪里被调用(调用栈)、函数的调用方法、传入的参数等信息。this 就是记录的其中一个属性，会在函数执行的过程中用到。

所以说对于 **this** 来说，在哪里被调用和如何被调用会起到决定性的作用。

## 默认情况

默认情况下，函数在全局被调用，此时的 this 默认指向 window（global)。严格模式下 this 绑定到 undefined。此时的严格模式特指函数内的严格模式，与调用处是否严格模式无关。

```js
function foo() { 
    console.log( this.a );
}
var a = 2; 
foo(); // 2

// 严格模式下
function foo() { 
    "use strict";
    console.log( this.a );
}
var a = 2;
foo(); // TypeError: this is undefined
```


## 隐式绑定

此时需要考虑函数调用位置的上下文对象。

```js
function foo() { 
    console.log( this.a );
}
var obj = { 
    a: 2,
    foo: foo 
};
// 使用 obj 上下文来引用函数
obj.foo(); // 2
```

对象属性引用链中只有最顶层或者说最后一层会影响调用位置：

```js

function foo() { 
    console.log( this.a );
}
var obj2 = { 
    a: 42,
    foo: foo 
};
var obj1 = { 
    a: 2,
    obj2: obj2 
};
// 使用 obj2 上下文来引用函数
obj1.obj2.foo(); // 42
```


### 绑定丢失

```js
function foo() { 
    console.log( this.a );
}
var obj = { 
    a: 2,
    foo: foo 
};

// 虽然 bar 是 obj.foo 的一个引用，但是实际上，它引用的是 foo 函数本身，因此此时的 bar() 
// 其实是一个不带任何修饰的函数调用，因此应用了默认绑定。
var bar = obj.foo; // 函数别名!
var a = "oops, global"; // a 是全局对象的属性 
bar(); // "oops, global"
```

另外一种情况是回调函数，不论是自己创建还是 JS 内置的像 setTimeout 这些方法，所以我们常常使用 `var _this = this` 来获得 this 的引用。

```js

// 回调函数常常会改变 this
function foo() { 
    console.log( this.a );
}
function doFoo(fn) {
    // fn 其实引用的是 foo 
    fn(); // <-- 调用位置!
}
var obj = { 
    a: 2,
    foo: foo 
};
var a = "oops, global"; // a 是全局对象的属性 
doFoo( obj.foo ); // "oops, global"

// 内置函数

function foo() { 
    console.log( this.a );
}

var obj = { 
    a: 2,
    foo: foo 
};
var a = "oops, global"; // a 是全局对象的属性 
setTimeout( obj.foo, 100 ); // "oops, global"
```

## 显示绑定

显式绑定即通过 **call** 或者 **apply** 改变 this 的指向。

```js
function foo() { 
    console.log( this.a );
}
var obj = { 
    a:2
};
foo.call( obj ); // 2
```

## 硬绑定

硬绑定即：`Function.prototype.bind`，在函数 bind 之后，此后再 apply、call、bind 都不会改变绑定。

比如 Array.prototype.forEach 等函数最后一个参数即绑定 this。

## new 绑定

```js
function foo(a) { 
   this.a = a;
}
var bar = new foo(2); 
console.log( bar.a ); // 2
```

几种绑定的优先级：**new 绑定 > 硬绑定 > 显示绑定 > 隐式绑定**。

## 间接绑定

一种比较特殊的情况：`(p.foo = o.foo)`这个赋值操作返回的是对 foo 的引用，执行的是默认绑定。

```js
function foo() { 
    console.log( this.a );
}

var a = 2; 
var o = { a: 3, foo: foo }; 
var p = { a: 4 };
o.foo(); // 3
(p.foo = o.foo)(); // 2
p.foo() // 4
```

## ES6 的箭头函数

箭头函数是一种不同的 this 的机制，根据外层的作用域确定 this 指向，取代 `var self = this`的写法，和 bind 一样，此后再次调用 call、apply、bind this 指向不会改变。

```js
function foo() { 
    setTimeout(() => {
    // 这里的 this 在此法上继承自 foo()
        console.log( this.a );
    }, 100);
}
var obj = { 
    a: 2
};
foo.call( obj ); // 2
```







