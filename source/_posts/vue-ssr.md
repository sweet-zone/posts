---
layout: post
title: vue ssr 实践
banner: assets/img/vue-ssr.jpg
tags: ssr
---

## 页面渲染历史

页面渲染的历史就是前端努力摆脱后端的历史。

早些时候，没有前后端之分，后端自己套模板写页面，稍微经验多些年岁的后端程序员都是有自己写页面的经历的经历的。（那些年，图书馆还流行网页设计三剑客，asp 生拖硬拽...）。再往后些，有了像 FreeMarker 这样的高级模板，但前端依然没有摆脱强依赖后端的局面。再后来，客户端渲染慢慢兴起，AngularJS 横空出世，React、Vue紧随其后，SPA 应用逐渐流行了起来，一直到现在都是主流，尤其是各种中后台系统。

SPA火了之后，又有 SEO、首屏时间、接口不自由等等的烦恼，所以 Node 出现之后，大家仿佛看见了救命稻草。除了工具链，前端也在探索 Node 在业务中的应用，并且有大量的业务已经落地。大多时候 Node 都是作为介于 Java 和 前端之间的媒介存在的，那自然，最早时候的 Java 模板，Node 也可以来做，而且可以做的更加从容，毕竟前端自己控制。

写久了会发现，还是很不舒服的。毕竟客户端的 Vue、React 一套模板，服务端另一套模板，写到精神分裂。那能不能合二为一呢。就有了同构渲染，也就是大家看到的十分有歧义的服务端渲染（ssr）。看起来仿佛绕了一个大圈，模板渲染还是回到服务端这边，但又有很大的不同和改进。

“历史总是螺旋式前进的。”

随后 React、Vue等框架也跟进了自己的 ssr 方案，本文就来说一下 vue ssr 相关的内容以及我们在项目中的一些实践。

## 使用 Vue SSR 

vue 的 ssr 操作上还是很简单的：服务端创建一个 vue 实例，交给 vue-server-render，渲染成一段 html 输出到浏览器里。

```js
const Vue = require('vue')
const app = new Vue({
  template: `<div>Hello World</div>`
})

const renderer = require('vue-server-renderer').createRenderer()

renderer.renderToString(app, (err, html) => {
  if (err) throw err
  console.log(html)
  // => <div data-server-rendered="true">Hello World</div>
})
```

但涉及到具体应用，不可能直接用上述代码（虽然我真的在某些场景下用过😂）。一般情况下，要使用 webpack，分别构建服务器所需要的服务端 bundle 和浏览器所用的客户端 bundle，将两者交给 vue-server-render，同样获取 vue 实例渲染成 html 输出浏览器，在浏览器端则可以继续享受数据绑定带来的便利。同时，因为有了 webpack 介入，可以在开发环境获得更好的体验。

![](https://cloud.githubusercontent.com/assets/499550/17607895/786a415a-5fee-11e6-9c11-45a2cfdf085c.png)

不过毕竟，SSR 模式的 vue 是同时存在于服务端和浏览器端的，所以在编码的时候还是有很多注意的点：

#### 应用程序实例独立，防止交叉污染：

浏览器环境，每个用户会把代码下载到自己本地，自然每个用户享受独立的 vue 实例。而服务器不同，每个用户的请求都会到服务器，所以为了防止交叉污染，每个请求都应该是独立的实例。代码一般看起来是这样：

```js
server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })

  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error')
      return
    }
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>${html}</body>
      </html>
    `)
  })
})
```

#### 避免服务端执行的逻辑引入浏览器变量和副作用代码

服务端只有 beforeCreated/created 两个钩子会执行，如果此时执行 window、document等变量，必然报错。

同时也防止在这两个钩子引入 setInterval、setTimeout 等代码。不同于浏览器，在 created 创建定时器可以在 destroy 时销毁掉，服务端中只会执行 beforeCreated/created 两个钩子，无处销毁，常驻内存，导致内存泄露。

所以可以把浏览器和定时器等相关逻辑移动至 mounted 钩子中。

#### 尽量编写平台通用的代码

最常用的，我们使用 axios 作为发送请求的工具，因为它适配了 node 和浏览器。如果使用其他库，一定要注意是否平台通用，否则需要给两端适配。

#### 编写标准的 HTML 模板

浏览器比较智能，会自动修复不标准的HTML结构，但 vue 生成的虚拟 DOM 不会，所以当在 vue 模板写如下代码时：

```html
<table>
  <tr><td>hi</td></tr>
</table>
```

浏览器会自动修复这段 html, 和 vue 生成的虚拟 DOM 不匹配，页面就会报一个服务端模板和客户端模板不匹配的错误。

#### 自定义指令

指令一般意味着操作 DOM，就很有可能在服务端渲染中报错。所以需要提供两个版本作为适配，或者抽象为组件。

#### 服务器压力

vue 虚拟 DOM 操作是一个很耗 CPU 的操作，和普通的模板字符串拼接性能差距很大。所以需要做好压测和缓存方案。

如果用户访问的内容不是个性化的（这也是我们推荐做 ssr 的场景），那么页面级别的缓存收益就相当的大。

```js
const microCache = LRU({
  max: 100,
  maxAge: 1000 // 重要提示：条目在 1 秒后过期。
})

const isCacheable = req => {
  // 实现逻辑为，检查请求是否是用户特定(user-specific)。
  // 只有非用户特定 (non-user-specific) 页面才会缓存
}

server.get('*', (req, res) => {
  const cacheable = isCacheable(req)
  if (cacheable) {
    const hit = microCache.get(req.url)
    if (hit) {
      return res.end(hit)
    }
  }

  renderer.renderToString((err, html) => {
    res.end(html)
    if (cacheable) {
      microCache.set(req.url, html)
    }
  })
})
```

在做了页面级别的缓存之后，经过压测，性能提高了5倍。（不同业务场景有所不同）。

所以，我们看到，虽然 ssr 带来了 seo 和首屏速度的优势（在当前网速环境下，这个优势还是不是优势？），但开发成本也是水涨船高，开发条件受限制、不同的构建脚本、更多的服务器压力、更大的运维成本。

对了一线业务开发人员，其实更多关注的开发和构建的便利性，后来我们看到了 nuxt。

## NUXT

nuxt 解决了构建配置和浏览器特定代码的处理，并扩展了一些概念，给了开发者更大的自由。

#### 约定大于配置

nuxt 对于原生 ssr有点像 eggjs 对于 koa，把很多通用的部分固化下来：pages 就代表路由，store 目录代表状态管理，static代表静态资源。

![](https://haitao.nos.netease.com/89cade21-40e0-4f4f-8b83-f4947bc61bb2_772_1158.jpg)

#### 引入概念 - middleware

类似于服务端中间件，nuxt 的中间件作用也是一样，每次访问路由都会执行。比如透传 cookie 这种比较繁琐的操作，nuxt 里就变得很简单：

```js
export default function(ctx) {
    if (process.server) {
        ctx.$axios.defaults.headers.common.cookie = ctx.req.headers.cookie;
    }
}
```

#### 引入概念 - plugin

通常应用启动前我们会把一些库挂载到 Vue 实例上，但之前我们说过，ssr 要注意浏览器变量的混入，所以之前的我们的代码是这样子：

```js
if(process.env.VUE_ENV !== 'server') {
    const Sentry = require('@sentry/browser');
    Vue.prototype.Sentry = Sentry;
}
```

会看到需要自己做环境判断，通过 if 引入nuxt 引入了 plugin 来解决这个问题，nuxt 贴心的使用了 ssr false 这个选项去掉了繁琐的判断。

```js
// plugins/sentry.js
import SentryVuePlugin from '@sentry/browser';
Vue.prototype.Sentry = Sentry;

// nuxt.config.js
plugins: [
    {
        src: '~/plugins/sentry',
        ssr: false
    }
]
```

#### 引入概念 - module

这个扩展给开发者更大自由去操作 nuxt，比如我们通过定制 renderer.renderRoute 实现页面级缓存：

```js
export default function cachePage(moduleOptions) {
    const renderer = this.nuxt.renderer;
    const renderRoute = renderer.renderRoute.bind(renderer);

    renderer.renderRoute = (route, context) => {
        let cacheRoute = '/cacheRoute';
        if(cacheRoute) {
            const cache = cacheStore.get(cacheRoute);
            if(cache) {
                console.log('hit cache');
                return cache;
            }
        }

        return renderRoute(route, context).then((result) => {
            if(!result.error) {
                cacheStore.set(route, result);
            }
            return result;
        });
    };
}
```

最后，nuxt 天然可以作为 express、koa 的中间件存在，所以nuxt很容易融入现有的框架中。

所以考虑到开发者便利和框架成熟度，还是比较建议使用 nuxt 的，当然，如果为了熟悉 vue ssr，也建议尝试下[官方的 demo](https://github.com/vuejs/vue-hackernews-2.0)。





