---
layout: post
title: 详解 Webpack（下）
banner: assets/img/webpack.jpg
label: 译
tags: webpack
---

JavaScript 模块打包工具已经出现有一段时间了。RequireJS 在2009年完成了第一次提交，然后 Browserify 随之出现，从那时候起相继出现了各种模块打包工具。在这些里面，webpack脱颖而出。如果你还不熟悉它，我希望这篇文章可以帮你开始使用这个强大的工具。

本文承接[详解 Webpack（上）](/2017/03/13/a-detailed-introduction-to-webpack-1.html)

## 使用插件

插件为 webpack 提供了一些实用性的功能。你有充分的自由将它们加入到 webpack 的工作流中，不像 loaders，插件并不限制用于某些文件。它们可以注入到任何地方，所以能做的就更多。很难去解释清插件到底能做什么，所以我只是告诉一个[名为 webpack-plugin npm 包的列表](https://www.npmjs.com/search?q=webpack-plugin)，应该能够很好的说明这一点。

在本教程中，我们仅接触两个插件（另一个稍后使用）。这篇文章到这里已经很长了，那我们就继续来一个插件的 demo。第一个我们要使用的插件是 [HTML Webpack Plugin](https://github.com/ampedandwired/html-webpack-plugin)，这个插件可以创建一个 HTML - 我们终于可以使用这个 web 应用了！

在使用这个插件之前，先更新一下 `scripts`，安装一个简单的 web 服务器来测试我们的页面。首先安装：`npm i -D http-server`，然后，然后我们修改 `execute` 为 `server`，并相应的更新 `start` 脚本：

```json
"scripts": {
  "prebuild": "del-cli dist -f",
  "build": "webpack",
  "server": "http-server ./dist",
  "start": "npm run build -s && npm run server -s"
},
```

webpack 构建完毕后，`npm start` 也会创建一个 web 服务器，你可以 访问`localhost:8080` 查看页面。当然，首先我们要先使用这个插件创建一个页面，安装插件：`npm i -D html-webpack-plugin`。

安装完成后，我们需要修改 `webpack.config.js`：

```js
var HtmlwebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: [
        'babel-polyfill',
        './src/main.js'
    ],
    output: {
        path: './dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/,
                options: { plugins: ['transform-runtime'], presets: ['es2015'] }
            },
            { test: /\.hbs$/, loader: 'handlebars-loader' }
        ]
    },
    plugins: [
        new HtmlwebpackPlugin()
    ]
};
```

我们主要做了两处修改：在文件顶部引入了插件，并在配置对象中添加 `plugins` 属性，传入了插件的实例。

现在，我们没有给插件传入任何选项，所以它会生成标准的模板，虽然没有包含什么，但已经包含了我们打包的脚本。如果你运行 `npm start`，你在浏览器中会看见一个空白页，不过如果你打开控制台，就会看到有 HTML 输出。

我们要将模板和 HTML 文件输出到页面而不仅仅是控制台中，普通人会从页面中看到一些东西（而不是空白页），首先在 `src` 目录下新建 `index.html` 文件，默认他会使用 EJS 作为模板引擎，不过你也可以插件使用[其他的模板引擎](https://github.com/ampedandwired/html-webpack-plugin/blob/master/docs/template-option.md)。我们将使用默认的 EJS 模板，下面是文件的内容：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
    <h2>This is my Index.html Template</h2>
    <div id="app-container"></div>
</body>
</html>
```

你会注意到一些点：

* 我们可以使用插件的一个选项设置 HTML 标题。
* 不必手动设置该添加的脚本。因为它会默认在 `body` 底部添加脚本。
* 这里有一个 `div` 和 `id`，现在我们就要使用它们。

有了模板后，至少现在不再是一个空白页面。更新 `main.js`，将 HTML 添加到 `div`，而不是打印到控制台中。在 `main.js` 最后添加一行：

```js
document.getElementById("app-container").innerHTML = template({numbers});
```

同时也要更新 webpack 的配置，给插件传递几个选项，现在你的配置文件变成这样：

```js
var HtmlwebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: [
        'babel-polyfill',
        './src/main.js'
    ],
    output: {
        path: './dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/,
                options: { plugins: ['transform-runtime'], presets: ['es2015'] }
            },
            { test: /\.hbs$/, loader: 'handlebars-loader' }
        ]
    },
    plugins: [
        new HtmlwebpackPlugin({
            title: 'Intro to webpack',
            template: 'src/index.html'
        })
    ]
};
```

`template` 选项声明了在模板的所在位置，`title`选项是传递给模板的标题，现在运行 `npm start`，你会在浏览器看到以下内容：

![index-html-template-opt.png](https://www.smashingmagazine.com/wp-content/uploads/2017/02/index-html-template-opt.png)

到这里我们完成了 `example5` 分支的所有工作。每个插件都有不同的选项和配置，有太多的插件，它们能做各种各样的事情。最后它们都会添加到 webpack 配置项 `plugins` 数组里。这里有很多方法去处理如何生成 HTML 页面，去填充页面内容，以及给页面添加带 hash 值得文件名（*译者注：应该是带 hash值的脚本文件或者 css 文件*）

在 `example6` 分支里，我通过一个插件增加了压缩 JavaScript 文件的功能，除非你想用 UglifyJS 做一些改变，要不你无需做其他事情。如果不喜欢 UglifyJS 的默认配置，修改 webpack.config.js 中插件的配置，如果默认配置符合你的心意，那么你就运行 `webpack -p`命令，`-p` 是 `production`  的缩写，也就相当于使用 `--optimize-minimize` 和 `--optimize-occurence-order` 参数。第一个参数代表压缩 JavaScript，第二个参数优化打包文件中各个模块的加载顺序，使得文件更小运行速度更快。这个仓库已经挺久了，那会我还不知道 `-p` 这个参数，所以我决定示例保持原样，能给你一点启发。另外一个你能用到的参数是 `-d`，这样 webpack 在执行时会展示更多的调试信息，并会生成不带额外信息的 sourcemaps。如果这些对你都很简单，你可以在了解更多 [命令行简写](http://webpack.github.io/docs/cli.html) 的知识。

## 懒加载

我最喜欢的 RequireJS 的一点是可以懒加载模块。一个超大的 JavaScript 文件可以减少请求数，但是也导致用户没有使用到的代码也被下载了下来。

Webpack 有一种方法可以将文件分割成多个懒加载的块，甚至你都不需要在配置文件中做什么配置。你只需要写点代码，Webpack 会处理剩下的事情。Webpack 提供了两种方法，一种基于 CommonJS，一种基于 AMD。使用 CommonJS 的话，看起来是这样：

```js
require.ensure(["module-a", "module-b"], function(require) {
    var a = require("module-a");
    var b = require("module-b");
    // …
});
```

使用 `require.ensure`，保证模块是可用的（但不执行它），传入模块的数组和一个回调。为了在回调中真正的使用这个回调，你需要使用回调的参数 `require` 显式的引入这些模块。

个人感觉，这种使用方法不太好，让我们看一下 AMD 的版本：

```js
require(["module-a", "module-b"], function(a, b) {
    // …
});
```

AMD 版本中，使用 `require` 方法传入模块的数组和一个回调。回调的参数指向这些模块，而且和数组的顺序一致。

Webpack2 也支持 `System.import`，使用 promises 而不是回调。这是一个很有用的改进，虽然你如果你真的想用 promise，这也不是难事。不过注意，`System.import` 已经废弃，因为已经有了新的 `import()` 规范。在 Babel（或者TypeScript）使用会抛出语法错误。你可以使用 [ babel-plugin-dynamic-import-webpack](https://www.npmjs.com/package/babel-plugin-dynamic-import-webpack)，但它会将 `System.import` 转换为 `require.ensure`，而不仅仅帮助 Babel 查看合法的 `import` 参数，这样 Webpack 就可以处理了。AMD 和 `require.ensure` 短时间不会消失，`System.import` 至少要到 Webpack3 才会支持，所以尽情的事情你喜欢的方式。（*译者注：这段有点懵逼*）

让我们增加一点代码，等待几秒钟，懒加载 handlebar 模板并将结果输出到页面上。我们移除掉文件顶部的 `import`，然后用 `setTimeout` 包起来，使用 AMD 方式 `require` 这段模板：

```js
import { map } from 'lodash';

let numbers = map([1,2,3,4,5,6], n => n*n);

setTimeout( () => {
    require(['./numberlist.hbs'], template => {
        document.getElementById("app-container").innerHTML = template({numbers});
    })
}, 2000);
```

现在运行 `npm start`，你会看到生成了另外一个资源，应该是 `1.bundle.js`。打开浏览器的开发者工具，切到 Network 面板，你会看到两秒后，一个新的文件加载进来，并执行。这并不难实现，但是却减少了文件的体积，增强了用户体验。

注意：这些子模块包括他们的所有依赖，都被包含在他们的父模块中。（你可以有多个入口，懒加载不同的模块，这样不同的模块就被加载进了各个父模块中）。（*译者注： 翻译待加强*）

## 创建 Vendor Chunk

让我们继续讨论一些优化点：vendor chunks。你可以定义一些单独的文件，用来保存一些通用的或者第三方的代码，这些代码通常不怎么变化。这样用户就可以先缓存这些文件。当你更新应用的时候，就不必再重新下载这些代码了。

为了做到这一点，我们需要使用 webpack 自带的一个插件：`CommonsChunkPlugin`。这是 webpack 自带的插件，所有我们不用额外安装什么。只要编辑配置文件即可：

```js
var HtmlwebpackPlugin = require('html-webpack-plugin');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

module.exports = {
    entry: {
        vendor: ['babel-polyfill', 'lodash'],
        main: './src/main.js'
    },
    output: {
        path: './dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/,
                options: { plugins: ['transform-runtime'], presets: ['es2015'] }
            },
            { test: /\.hbs$/, loader: 'handlebars-loader' }
        ]
    },
    plugins: [
        new HtmlwebpackPlugin({
            title: 'Intro to webpack',
            template: 'src/index.html'
        }),
        new UglifyJsPlugin({
            beautify: false,
            mangle: { screw_ie8 : true },
            compress: { screw_ie8: true, warnings: false },
            comments: false
        }),
        new CommonsChunkPlugin({
            name: "vendor",
            filename: "vendor.bundle.js"
        })
    ]
};
```

在第三行，我们引入了这个插件，`entry` 入口，我们使用对象字面量来声明多入口文件，`vendor` 入口标识那些被包含进 vendor chunks 的文件 - 这里我们包含了 polyfill 和 lodash，我们把应用的代码放进 `main.js` 内。然后只要在 plugins 入口增加 `CommonsChunkPlugin` 插件，在插件中声明 `vendor` 出口并且 vendor chunks 的代码命名为 `vendor.bundle.js`。

通过声明 vendor chunks，这个插件会把这个 chunks 的所有依赖从入口文件抽离出来放到 vendor chunks 中。如果你声明 vendor 的名字，它会根据入口的依赖文件生成一个单独的文件。

当你运行 webpack 后，你会看到生成了三个 JavaScript 文件：`bundle.js`、`1.bundle.js`、`vendor.bundle.js`。如果你喜欢的话，可以再次运行 `npm start` 在浏览器中查看结果。看起来 webpack 是在应用的主代码中处理 vendor chunks 的加载，真的很有用！

这就是 `example8` 的所有内容，也是本教程的所有内容。我讲到了很多，但也只是 webpack 的一小部分而已。webpack 包括了更加简单的 CSS 模块、缓存（cache-busting）hash、图片优化等等很多很多，每一点都可以长篇大论。我不能给你展示所有的知识点，而且等我写完了，好多都已经过时了！所以尝试一下 webpack，让我知道提高了你的工作效率！

上帝保佑，happy coding！

---

文章是在太长，分成上下两部分。
原文地址：[A Detailed Introduction To Webpack](https://www.smashingmagazine.com/2017/02/a-detailed-introduction-to-webpack/)

---

翻译水平实在有限 ~ 如果有疑惑可以直接运行仓库例子 ~























