
layout: post
title: eggjs 远程调试
banner: assets/img/remote.jpg
tags: nodejs
---

可能是最短的文章。

周五晚因为一个服务器和本地运行不一样的问题卡住了，急需远程调试。

vscode 没搞成功，webstorm 没搞成功。。后来才发现，eggjs npm run debug之后，生成一个调试信息：

```
chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9999/__ws_proxy__
```

这段直接粘贴到 chrome 浏览器就可以用的，打断点什么的轻轻松松。

如果是远程服务器，改一下 IP 就可以了：

```
chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=111.111.111.111:9999/__ws_proxy__
```

完事！