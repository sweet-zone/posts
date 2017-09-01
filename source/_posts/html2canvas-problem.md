
layout: post
title: HTML2Canvas 问题拾遗
banner: assets/img/html2canvas.jpeg
date: 2017-9-1 20:22
tags:
- JavaScript
- canvas
---

[HTML2Canvas](https://html2canvas.hertzen.com/)可以将 DOM 结构转为 canvas，然后你可以通过 `canvas.toDataURL()` 等方法得到图片：


```js
html2canvas(document.getElementById('screenshot'), {
    width: 640,
    useCORS: true,
    background: '#fff',
    onrendered: function (canvas) {
        var imgUrl = canvas.toDataURL()
        // ...
    }
})
```


使用起来很简单，不过在使用过程中还是遇到了一些问题：

## 跨域图片

对于要截图的 DOM 的结构，里面的图片要么是域内的，要么图片是允许跨域的。

在确定图片允许跨域后，相应的 img 标签需要增加 `crossorigin` 属性：

```html
<img crossorigin="anonymous" src="http://xxx.yyy.jpg" alt="">
```

同时设置为 html2canvas 设置 `useCORS: true`，这样就可以得到正确渲染的 DOM 截图。

关于 `crossorigin`，更多内容可以查看 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/CORS_enabled_image)。

## CSS样式

DOM 结构需要使用 **px** 作为单位。做移动端项目的时候，很多时候会使用 rem，但需要截图的 DOM 如果使用了 rem 单位，一些 Android 手机会表现异常，截图内元素大小比例错乱，即使这个时候 DOM 结构是正确渲染的。

在使用中，还发现 html2canvas 不能正确的识别 `text-overflow` 属性，所以并没有得到期望单行截断多余省略的效果，而是直接截断了。最后只能 JS 实现截断了。这个已经有人提 [issue](https://github.com/niklasvh/html2canvas/issues/324) 了，回复结果就是不支持，建议 JS 实现了。

## 图片参数问题

有些图片服务增加链接参数可以对图片进行相应处理，比如网易的 NOS 服务：`https://yanxuan.nos.netease.com/480738e9becacdb10206ae35d7e6e84f.jpg?imageView&thumbnail=420y420&enlarge=1&t=1503999054021`，这个图片加了裁剪参数。但是在使用时发现加了这些参数会导致有时截图失败，抓包得到的结果确实是图片加载失败，但不知道具体是什么原因，暂时去掉参数加载原图解决。如果有了解求告知 ~


其实 HTML2Canvas 官方文档也列出了这些限制：

> All the images that the script uses need to reside under the same origin for it to be able to read them without the assistance of a proxy. Similarly, if you have other canvas elements on the page, which have been tainted with cross-origin content, they will become dirty and no longer readable by html2canvas.
The script doesn't render plugin content such as Flash or Java applets. It doesn't render iframe content either.

不过不妨碍它是个伟大的工具，可以在前端实现一些比较复杂的生成图片的操作。










