---
layout: post
title: Nodejs 微信公众号开发
banner: assets/img/egg-wechat-mp.jpg
tags: nodejs
---

时至今日，微信公众号与前端息息相关，很难想象还有什么项目不搭微信这个车。本文对 Nodejs 微信公众号开发进行简单的介绍。

**下面讲到基本都是认证过的公众号，请在测试时确认。**
**代码使用 eggjs。**

## 网页授权

> 微信网页授权是通过OAuth2.0机制实现的

现在基本所有的应用授权都是基于 OAuth2.0 实现的，大致流程如下图：

![img](/posts/assets/img/20180910-164119.jpg)

具体可以参考阮一峰的文章：[理解 OAuth2.0](http://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)。

微信内基本流程和上图基本一致，文档：[https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)。

需要注意的是，这里获取的 `access_token` 只是用过网页授权之用，如果要做其他事情，则需要 `基础 access_token`。

> 其他微信接口，需要通过基础支持中的“获取access_token”接口来获取到的普通access_token调用

## 模板消息

> 模板消息仅用于公众号向用户发送重要的服务通知，只能用于符合其要求的服务场景中，如信用卡刷卡通知，商品购买成功通知等。

## JSSDK

> 微信JS-SDK是微信公众平台 面向网页开发者提供的基于微信内的网页开发工具包。

前端最常搭交道的就是这货了。

一般前端对如果使用 wx 提供的 API 已经比较熟悉了，我们主要说下 wx.config 的几个参数是如何生成的。

* 获取通用 access_token
* 获取JS-SDK 票据：jsapi_ticket
* 根据签名算法获取签名 signature

获取签名需要上述三个步骤，jsapi_ticket 接口获取即可，签名有一个不太复杂算法：

* 准备签名字段
* 字典序排序&拼接字符串
* 对排序字符串sha1，得到签名

参与签名的字段有：jsapi_ticket、nonceStr、timestamp、url，这里注意下 nonceStr 在下面拼接字符串的时候变成了 noncestr，timestamp 使用的是精确到秒的时间戳。

```js
async getSignature(ticket, noncestr, timestamp, url) {
    const { ctx } = this;
    const str = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
    return ctx.helper.sha1(str);
}
```

## 开发者模式

开发者模式可以让开发者更好的控制微信公众号，不过有些不方便的是，你需要写代码控制原本可以手动配置的自定义菜单。原理大致如下图：

![img](/posts/assets/img/20180910-165529.jpg)

其他可以看文档的[入门指引](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1472017492_58YV5)，很详细了。








