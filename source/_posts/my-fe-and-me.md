
layout: post
title: 我和前端的2017
banner: assets/img/myself-recently.jpeg
tags: life
---

16年其实一直在做 Electron 的桌面应用（Mac 为主），春节后也一直在做，那时候重心开始放在内嵌 webview 的开发，开始探索如何更好的给 web 应用提供接口，更好的展示 web 内的应用，并且随着内置的云盘和新闻项目，也有了一些实践经验。

紧接着，webpack 发布了重要的 2.0 版本，正好我们的打包脚本对于项目也开始有些乏力，所以开始决定重构打包脚本，将 webpack 替换为 2.0，同时将一些 gulp 任务也改为直接借助 webpack 及其插件实现。打包脚本修改的同时，也兼顾到了端与端的差异，比如桌面端会用到的 nodejs 模块在 Web 端需要忽略掉，此时也真正的将 web 版本和桌面版本的代码合在了一起，推动几个小伙伴在代码层面做了重构，并顺利的部署在了测试环境。

不过有时候就是这么不巧，这个接到通知需要去另外一个项目。所以虽然该重构的也重构了，该合并的也合并了，总觉得还是有点遗憾。

换到了新的项目组之后，主要的工作也从 Web 技术开发客户端回到了传统的 web 项目，虽然是移动端项目，但我一般不认为移动端项目有什么特殊之处。不过各种国产机总会给你意想不到的惊喜，所以有时候代码写的还是挺谨慎。

在开发内部使用的后台的时候，用了一波 vue，虽然这个时候采用 vue 显得有点晚了一些。vue 确实给后台的开发提升了很大的速度，团队还有一个 ios 的小伙，也是很快的上了手，并承担了大部分任务。感觉以后可能会有一个岗位叫 vue 开发工程师。。。

进入新的项目后可能对我最重要的影响是，让我对一些很基础的东西有了新的认识，比如：浏览器本地存储（cookie、sessionStorage、localStorage），跨域请求（预检请求的触发、跨域读写 cookie 以及如何 IE8 下兼容 CORS）。

然后再感受一点技术无关的事情，在项目里算是体验了一点电商的感觉，市场和运营在主导着产品的走向，开发的节奏也很不稳定。前端来说，可能要给运营产出很多的活动页或者工具，就要求这些工具有很大的灵活性，能够很快的上线新的需求。

然后不巧的事情又发生了，又要准备打包去另外一个项目组了。

所以最近的日子还是很平稳的，所以就有时间到处看看，看了下 virtual dom 然后自己撸了个库；看路由的实现，自己搞一下实现；翻翻 spring boot，和服务端更好的交流；看看数据可视化的例子，养养眼。。

流水账以这样记录了一年的事情，好像有些没记起来没写进去，新的一年有新的项目，希望可以有新的积累。















