
layout: post
title: JavaScript 中的 AOP
banner: assets/img/webpack.jpg
tags: javascript
---

最早接触 AOP 这个概念是因为使用 [NEJ](https://github.com/genify/nej) 这个框架。在[平台适配系统](https://github.com/genify/nej/blob/master/doc/PLATFORM.md)这篇文档中详细讲解了 NEJ 是如何使用 AOP 思想来做平台适配工作的。

## 什么是 AOP

AOP 是 Aspect Oriented Programming（面向切面编程）的缩写，其核心思想是将横切关注点从主关注点中分离出来，因此特定领域的问题代码可以从标准业务逻辑中分离出来，从而使得主业务逻辑和领域性业务逻辑之间不会存在任何耦合性。

## NEJ 中的 AOP

上面说到，NEJ 是基于 AOP 的思想来做平台适配的。在做平台适配的时候，我们经常会写出这样代码：

```js
function doSomething(){
    if(isTrident){
        // TODO trident implement
    }else if(isWebkit){
        // TODO webkit implement
    }else if(isGecko){
        // TODO gecko implement
    }else if(isPresto){
        // TODO presto implement
    }else{
        // TODO w3c implement
    }
}
```

上面的代码对主逻辑有极强的侵入性，而且在日后修改的时候总是会修改到主逻辑，变的难以维护。

```js
function doSomething(){
    // TODO w3c implement
}

// trident implement
doSomething = doSomething._$aop(
    function(_event){
        // TODO trident implement
    }
);
// … …

doSomething(1,2,3);
```

我们来看下 NEJ `_$aop` 的实现：

```js
var _extpro = Function.prototype;
    /**
     * AOP增强操作，增强操作接受一个输入参数包含以下信息
     *
     *  | 参数名称 | 参数类型  | 参数描述 |
     *  | :--     | :--      | :-- |
     *  | args    | Array    | 函数调用时实际输入参数，各增强操作中可以改变值后将影响至后续的操作 |
     *  | value   | Variable | 输出结果 |
     *  | stopped | Boolean  | 是否结束操作，终止后续操作 |
     *
     * @method external:Function#_$aop
     * @param  {Function} arg0 - 前置操作，接受一个输入参数，见描述信息
     * @param  {Function} arg1 - 后置操作，接受一个输入参数，见描述信息
     * @return {Function}        增强后操作函数
     */
    _extpro._$aop = function(_before,_after){
        var _after = _after||_f,
            _before = _before||_f,
            _handler = this;
        return function(){
            var _event = {args:_r.slice.call(arguments,0)};
            _before(_event);
            if (!_event.stopped){
                _event.value = _handler.apply(this,_event.args);
                _after(_event);
            }
            return _event.value;
        };
    };
```
`_$aop` 挂载在 Function 的原型，接受两个参数，一个是方法的前置操作，一个是后置操作。做平台适配的时候可以传入前置方法，给特定平台加入特定代码，完成后再执行主逻辑里标准规范的代码。可以看到，主逻辑并没有被侵入，适配的逻辑都写在了外部。在需要修改或者移除该平台的适配的时候，只需修改前置操作的方法即可。主逻辑不受任何影响。

## ES7 中的 AOP - 装饰器

ES7 借鉴其他语言（如 python）引入了装饰器的概念，让我们可以更优雅的在 JavaScript 中使用 AOP。ES7 中的装饰器主要对类进行类进行装饰，可以对类、类方法、类属性进行装饰。

```js
class Man {
    say(str) {
        console.log(str);
    }
}
```

调用 setAge 设置年龄的时候，我们需要做一些校验，比如只允许数字。

## Typescript 中的 AOP - 装饰器和反射

## 一些应用

## 和 OOP 的区别

## 和中间件的区别


















