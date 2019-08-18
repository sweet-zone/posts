---
layout: post
title: 前端长列表渲染优化
banner: assets/img/performance.jpg
tags: 
- JavaScript
- performance
---

对于长列表，一般的应用可以通过分页解决。然而现在很多的应用列表部分可能是滚动加载的，随着滚动，列表项越来越多，影响性能和体验，尤其是移动设备上；另一种是IM应用，像会话列表、好友列表、群成员列表通常会一次性加载。在这些情况下，对于长列表的优化就显得很有必要。

[Clusterize.js](http://clusterize.js.org/)就是这样一个库，短小精悍。它会将列表划分成一个个的cluster，随着滚动只显示当前可见的cluster，并在列表的顶部和底部填充额外的高度，展示列表的真实高度。

> The main idea is not to pollute DOM with all used tags. Instead of that - it splits the list to clusters, then shows elements for current scroll position and adds extra rows to top and bottom of the list to emulate full height of table so that browser shows scrollbar as for full list.

不过Clusterize.js是基于DOM的，随着MVVM框架的流行，大家更多的是在操作数据，所以我基于Clusterize.js做了Clustery.js。

## 如何使用 Clustery.js

首先了解一下[Clusterize.js](http://clusterize.js.org/)。

Clusterize.js有超多的配置项、公共方法和回调函数，在操作 DOM 的时候比较有用。Clustery.js 做了大量的简化，不必再引入 Clusterize.js 自带的 css，增加了 `item_height` 的配置，显式的声明每一项的高度；`rows` 不再是 DOM 元素的数组，而是用于渲染的数据。下面是所有的配置项、回调和公共方法：

```js
this.clustery = new Clustery({
    scrollElem: scrollElem,
    contentElem: contentElem,
    rows: rows,
    item_height: itemHeight,
    rows_in_block: 20,
    blocks_in_cluster: 4,
    callbacks: {
        shouldUpdate: function(data) {
            _this.setRenderData(data)
        }
    }
});

// if you want to destroy
this.clustery.destroy();

// if you modify itemHeight manually
this.clustery.refresh(item_height);

// if you update data
this.clustery.update(newRows);
```

`callbacks`暂时只有一个回调，当需要渲染的数据改变时触发 `shouldUpdate` 方法，参数 `_data` 可能是一个对象也可能是一个数字(仅仅是 `bottom_offset` 改变)：

```js
{
    start: 0,   // 渲染列表从start到end, 此时需要渲染arr.slice(start, end)   
    end: 80,
    top_offset: 1245,   // 列表顶部填充高度
    bottom_offset: 3349 // 列表底部填充高度
}
```

可以去 Github 中查看 [DEMO](https://github.com/zjzhome/Clustery.js)

如果你对实现原理感兴趣，请继续往下看 :wink:

## 实现原理

为了实现随滚动只加载可见区域，Clusterize.js 引入了几个概念：

```js
{
    rows_in_block: 0,     // 每一个block包含的rows
    block_height: 0,      // 每一个block的高度 item_height * rows_in_block
    blocks_in_cluster: 4, // 每个cluster包含的blocks的个数
    rows_in_cluster: 0,   // 每一个cluster包含的rows blocks_in_cluster * rows_in_block
    cluster_height: 0,    // 每一个cluster的高度 block_height * blocks_in_cluster
}
```

整个列表被划分为一个个的 `cluster`，每个 `cluster` 包含多个 `block`，每个 `block`包含多个 `rows`，也就是渲染的最小单位 - 每行数据。

首先要确定上述几个配置项的值。每一项的高度 `item_height` 是由用户传入的，然后需要确定的是 `row_in_block`，因为其他几个值得计算都是依赖于它的：

```js
// 我们将整个可见的区域作为一个 block
// 除以 item_height 就得到每个 block 内包含的 rows

if(!opts.rows_in_block) {
  opts.rows_in_block = Math.ceil(this.scroll_elem.offsetHeight / opts.item_height);
}
```

其他配置项也能轻松得到了：

```js
opts.block_height = opts.item_height * opts.rows_in_block;
opts.rows_in_cluster = opts.blocks_in_cluster * opts.rows_in_block;
opts.cluster_height = opts.blocks_in_cluster * opts.block_height;
```

然后就开始处理用户滚动的事件了，随着用户滚动，我们需要确定需要渲染哪个 `cluster`:

```js
// get current cluster number
// 一个 cluster 包含多个 block, 整理减掉一个 block 的高度可以看作是缓冲
// 在用户没有滚动到这个 cluster 的底部的时候就已经加载下个 cluster, 防止出现短暂的空白.
getClusterNum: function () {
  this.options.scroll_top = this.scroll_elem.scrollTop;
  return Math.floor(this.options.scroll_top / (this.options.cluster_height - this.options.block_height)) || 0;
}
```

然后我们需要生成新的 cluster 进行渲染：

```js
// 其实是 getClusterNum 的一次反向运算，计算出数据从第几项开始渲染
var items_start = Math.max((opts.rows_in_cluster - opts.rows_in_block) * cluster_num, 0),
  items_end = items_start + opts.rows_in_cluster,
  top_offset = Math.max(items_start * opts.item_height, 0),
  bottom_offset = Math.max((rows_len - items_end) * opts.item_height, 0);
```

其实我们可以看出来，每个 cluster 并不是独立的，而是重叠的，所以在快速滚动的时候，不会有空白的情况出现。

最后库额外做了其他事情，把之前的数据缓存起来，滚动的后的计算结果和缓存内的比较，如果有变化，就调用用户传入的回调函数通知用户渲染数据。




