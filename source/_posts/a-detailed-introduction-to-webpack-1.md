---
layout: post
title: 详解 Webpack（上）
banner: assets/img/webpack.jpg
label: 译
tags: webpack
---

JavaScript 模块打包工具已经出现有一段时间了。RequireJS 在2009年完成了第一次提交，然后 Browserify 随之出现，从那时候起相继出现了各种模块打包工具。在这些里面，*webpack*脱颖而出。如果你还不熟悉它，我希望这篇文章可以帮你开始使用这个强大的工具。

## 什么是模块打包工具

在大多数语言中（包括 ECMAScript 2015+，JavaScript 的最新标准，但还没有被浏览器广泛支持），你可以将代码分割成多个文件，然后将这些文件导入到你的应用中，来使用他们所包含的功能。浏览器并没有内建这样的功能，所以模块打包工具如果要实现这些功能，有以下几种方式：异步加载模块，在加载完成后执行；或者是将所有需要的文件合并成一个 JavaScript 文件，在 HTML 里通过 `<script>` 标签加载。

不使用模块管理和打包工具，你也可以手动合并你的文件，然后使用数不清的 `<script>` 标签引入，不过这样做缺点也很明显：

* 你需要保证需要加载的文件的顺序，包括文件的依赖关系以及你要保证不要加载那些你不需要的文件。
* 越多的 `<script>` 的标签意味着要加载你的代码需要更多的服务器请求，影响性能。
* 很明显，这需要大量的手动操作，而不是让计算机来做处理。

大多数的模块打包工具可以很简单的和 npm 或者 Bower 集成，这样你就可以为你的应用添加第三方依赖。你只需要安装并且用一行代码导入到你的应用中。然后运行打包工具，你的应用代码就和第三方代码合并到一起；或者你配置正确，你可以把你所有的依赖代码打包到另外一个文件里，这样当你更新了应用的代码，用户更新应用代码的缓存时候，就不必重新下载这些依赖库的代码。

## 为什么选择 Webpack

现在你已经基本了解 webpack 的作用了，但为什么你要选择 webpack，有这么几个原因：

* 其中一个优势是相对来说它比较新，所以它能够避免之前的工具们存在的一些缺陷和问题。
* 上手简单。如果你只是想要把所有 JavaScript 文件打包成一个文件，而不做其他事情，你甚至都不需要配置文件。
* 它的插件系统可以做更多的事情，使得它更加强大，所以，或许构建工具，一个 webpack 足够了。

我见过一些其他和 webpack 功能类似的打包和构建工具，但 webpack 更胜一筹：当你遇到困难时你可以去庞大的社区寻找帮助。Browserify 的社区也挺大，但是它缺少一些 webpack 具有的潜在的必需的特性。我把所有的赞誉都给了 webpack，你们一定等我开始 show my code 了，开始吧 ~

## 安装 Webpack

在使用 webpack 之前，我们首先需要安装它。我假设你已经安装了 Nodejs 和 npm，如果你还没安装他们，查看 [Nodejs 官网](https://nodejs.org/)。

有两种方式来安装 webpack（其实其他命令行程序也是一样）：全局安装和局部安装。如果你选择全局安装，你可以在任意目录下使用，但是它不会作为你局部依赖存在，并且你不能在不同的项目之间切换 webpack 的版本（一些项目可能需要更新一点的版本，你可能不得不等一等再升级）。所以对于命令行程序我更倾向于局部安装，然后使用相对路径或者 [npm scripts](https://docs.npmjs.com/misc/scripts) 来运行程序。如果你没有局部安装过命令行程序，你可以读一下我写的一篇文章，关于摆脱[全局安装 npm 包](https://www.joezimjs.com/javascript/no-more-global-npm-packages/)。

接下来我们会使用 npm scripts 来进行我们的例子，所以我们依然局部安装 webpack。首先为了试验和学习 webpack，我们先创建一个目录。你可以克隆我 [github 上的仓库](https://github.com/joezimjs/webpack-Introduction-Tutorial)，在接下来的学习中你可以切换分支；或者你可以重新创建一个新的项目，然后使用我仓库中的代码作为比较。

通过命令行进入你的项目目录，使用 `npm init` 初始化项目，除非你要把项目发布到 npm 上，否则，你填入什么项目信息并不重要。

这时候你项目里增加了一个 `package.json` 文件（通过`npm init`创建），你可以把依赖保存在这里。所以我们使用 npm 安装 webpack 为项目的一个依赖项：`npm install webpack -D`。（使用 `-D` 代表这是一个开发依赖，保存在 `package.json` 的 `devDependencies` 里，你也可以使用 `--save-dev` ）。

在使用 webpack 在之前，我们需要创建一个简单的应用。首先我们安装 [lodash](http://www.lodash.com/)，这样我们的应用就有一个依赖：`npm install lodash -S`（`-S` 同 `--save`），然后我们创建一个名为 `src` 的目录，在里面创建一个文件： `main.js`：

```js
var map = require('lodash/map');

function square(n) {
    return n*n;
}

console.log(map([1,2,3,4,5,6], square));
```

很简单对不对？我们创建一个从1到6的数字数据，然后使用 loadsh 的 map 方法将原数组每一项平方得到一个新的数组。最后我们通过 console 打印出新数组。这个文件可以使用 Nodejs 运行，运行 `node src/main.js` 输出结果为 `[ 1, 4, 9, 16, 25, 36 ]`。

但是我们想将这段短小的代码和我们需要的 lodash 代码打包，并且可以在浏览器运行，webpack 可以做到么？我们该怎么做？

## 使用 Webpack 命令行

使用 webpack 最简单的方法就是直接命令行运行，而不用去花费时间去写一个配置文件。最简单的 webpack 命令行，不必使用配置文件，只需要输入文件路径和输出文件路径两个参数。Webpack 会读取输入文件，遍历依赖树，将所有文件打包成一个文件，输出到你指定的输出文件路径。在这个例子中，我们的输入路径是 `src/main.js`，我们想把打包文件输出到 `dist/bundle.js`，所以我们来创建一个 npm scripts 来做这件事情（我们没有全局安装 webpack，所有不能直接从命令行运行），在 `package.json` 中，编辑 `scripts` ：

```json
"scripts": {
"build": "webpack src/main.js dist/bundle.js"
}
```

现在，运行 `npm run build`，webpack开始工作，当运行完毕——不会很长时间——会生成一个新的 `dist/bundle.js` 文件。你可以在 nodejs 或者 浏览器中运行打包后的文件，你会得到同样的输出结果。

在继续探索 webpack 之前，我们先完善一下构建脚本：重新构建之前先删除 `dist` 目录及其内容，并且增加一些脚本来运行打包后的文件。首先我们安装 `del-cli` 来删除目录，这样不会让使用不同系统的人感到苦恼（不要恨我，我用的 windows）；运行`npm install -D`安装。然后我们更新 npm scripts：

```json
"scripts": {
  "prebuild": "del-cli dist -f",
  "build": "webpack src/main.js dist/bundle.js",
  "execute": "node dist/bundle.js",
  "start": "npm run build -s && npm run execute -s"
}
```

`build` 命令和之前一样，增加了 `prebuild` 来做一些清理工作，这个命令每次都会先于 `build` 运行，同时增加 `execute` 命令，使用 nodejs 运行打包后的脚本。然后使用 `start` 运行所有的命令（`-s` 可以让 npm scripts 不会输出一些无用的信息）。运行 `npm srart`，你可以看到 webpack 的输出，开平方后的数组打印在了控制台上。恭喜你，你完成了之前我提高的仓库的 `example1` 分支的所有工作。

## 使用配置文件

虽然我们愉快的使用命令开始使用 webpack，但当我们开始使用 webpack 更多的特性的时候，你会把所有传进命令行的配置项都移入配置文件中，使用配置文件，功能更强大，代码更加易读。因为它是用 JavaScript 写成的。

让我们创建一个配置文件。在你项目的根目录，创建一个名为 `webpack.config.js` 的文件，这是 webpack 默认查找的文件。你也可以给 webpack 传入 `--config [filename]`，告诉 webpack你想使用不同名字或者其他目录的配置文件。

在本教程中，我们使用标准的文件名。现在我们使用配置文件来完成上面我们使用命令行完成的任务。我们在配置文件中添加几行代码：

```js
module.exports = {
    entry: './src/main.js',
    output: {
        path: './dist',
        filename: 'bundle.js'
    }
};
```

就像在命令行中一样，我们指明了输出文件和输入文件。这是一个 JavaScript 文件，不是 JSON，所有我们需要到处配置对象 - 使用 `module.exports`。现在可能看起来不如命令行中优雅，不过读到文章最后，你会对这个决定感到欣喜的。

现在我们可以从 `package.json` 中移除传给 webpack 的命令行参数了，你的 scripts 看起来应该是这样：

```json
"scripts": {
  "prebuild": "del-cli dist -f",
  "build": "webpack",
  "execute": "node dist/bundle.js",
  "start": "npm run build -s && npm run execute -s"
}
```

你依然可以运行 `npm start`，并得到相同的结果。这样我们就完成了 `example2` 分支的内容。

## 使用 Loaders

主要有两种方法来增强 Webpack 的能力：loaders 和 plugins。插件我们将稍后讨论。现在我们将关注点放在 loaders 上，loaders 可以用来对特定类型的文件进行转化和操作。你可以将多个 loader 串起来对同一个文件进行处理。例如，你可以使用 [ESLint](http://eslint.org/)对所有扩展名是 `.js` 的文件进行检查，并且使用 [Babel](https://babeljs.io/)将他们从 ES2015 的语法编译为 ES5，如果 ESLint 出现警告就会在控制台打印出来，如果遇到错误，就会中断 Webpack 操作。

说回我们的小程序，我们不会安装任何检查工具，但我们会安装 Babel，把我们的代码编译为 ES5。当然，我们需要先写点 ES2015 的代码，我们把 `main.js` 的内容改为：

```js
import { map } from 'lodash';

console.log(map([1,2,3,4,5,6], n => n*n));
```

这段代码本质上做了和之前相同的事情，但是（1）我们使用了箭头函数，而不是名为`square`的方法，并且（2）我们使用了 `import` 语法来引入的 lodash 的 map 方法。这样就会把整个 lodash 文件打包进来，而不是通过 `lodash/map` 只引入 `map` 相关的方法。如果你愿意，你可以把代码第一行改为 `import map from lodash/map` , 但是我这么做有这么几点原因：

* 在大型应用中，你或许会引入很大块的lodash，这和全部引入也差不多。
* 如果你使用 Backbone.js，很难做到每次单独引入方法，因为没有文档告诉你 Backbone.js 到底需要多少个方法。
* 在下一个版本的 webpack 中，会引入一项新的技术 - tree-shaking，可以排除掉没有用到的模块，所以还是达到了上面的目的。
* 我想把这个作为例子，来告诉你刚才我提到的这一点（*译者注： 应该是 tree-shaking 这一点*）。

（注意：Lodash 可以使用上述两种方法引入，是因为它的开发者使之可以这么做，而不是所有的库都可以这么做）

不管怎么说，我们使用了一些 ES2015 的语法，我们需要将其编译为 ES5，这样就可以在老旧的浏览器中使用了（[ES2015在新的浏览器的支持](http://kangax.github.io/compat-table/es6/)还是很喜人的）。我们需要 Babel 及其附属来配合 webpack 工作，至少需要 [babel-core](https://www.npmjs.com/package/babel-core)（Babel的核心，承担大部分工作）、[babel-loader](https://www.npmjs.com/package/babel-loader)（基于 babel-core 的 webpack loader）、[babel-preset-2015](https://www.npmjs.com/package/babel-loader)（包含了 ES2015 编译到 ES5 的规则），我们还需要 [babel-plugin-transform-runtime](https://www.npmjs.com/package/babel-plugin-transform-runtime)和[babel-polyfill](https://www.npmjs.com/package/babel-polyfill)。这俩都是用来在你的代码加 polyfill 或者添加 helper 方法，用途差不多。不过我全部添加到项目里，你会看见他们是如何工作的，如果你想更多的了解他们，请求阅读文档： [polyfill](http://babeljs.io/docs/usage/polyfill/) 和 [runtime transform](http://babeljs.io/docs/plugins/transform-runtime/)。

一股脑的安装：`npm i -D babel-core babel-loader babel-preset-es2015 babel-plugin-transform-runtime babel-polyfill`，然后在配置文件中使用他们，首先需要一块地方配置 loaders，更新你的 webpack.config.js：

```js
module.exports = {
    entry: './src/main.js',
    output: {
        path: './dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            …
        ]
    }
};
```

我们添加了一个属性 `module`，里面包含 `rules` 属性，rules属性是一个数组，包含了你所用的的所有 loader 的配置。接下来我们会在这里添加 babel-loader，对每个 loader 来说，我们至少需要设置两个选项：`test` 和 `loader`，`test` 通常是一个正则表达式，来匹配每个文件的绝对路径，不过一般我们只是匹配文件的扩展名，例如，`/\.js$/` 匹配扩展名为 `.js` 的文件；如果你想在应用中使用 React，设置 `/\.jsx?$/`，就会匹配 `.js` 和 `.jsx`。现在我们需要设置 `loader`，也就是 `test` 匹配到的文件需要使用的 loader。

loader 通过传入 loader 的名字来指定，loader 的名字有短横线分割，比如 `'babel-loader!eslint-loader'`。webpack 从右向左读取，`esling-loader` 会先于 `babel-loader` 执行。如果你想给 loader 设置选项，使用查询字符串语法。例如给 babel 设置 `fakeoption` 为 `true`，我们需要把之前的例子改为 `babel-loader?fakeoption=true!eslint-loader`，你也可以使用 `use` 选项传入 loaders 的数组，如果你觉得这样更加简单更加易读。例如，最后的一个例子就变成：` use: ['babel-loader?fakeoption=true', 'eslint-loader']`，如果你增强可读性，可以写成多行。

*译者注: 上文其实是 webpack1 和 webpack2 的区别：[https://doc.webpack-china.org/guides/migrating/#-loaders](https://doc.webpack-china.org/guides/migrating/#-loaders)*

因为我们只用到了 babel-loader，loader 的配置如下：

```js
rules: [
    { test: /\.jsx?$/, loader: 'babel-loader' }
]
```

如果只用到了一个 loader，这里有另外一种方式去设置 loader 的选项，不是之前提到的查询字符串的方式：使用 `options` 选项，它可以使用 key-value 的形式，对于例子中的 `fakeOptions`，我们可以这样配置：

```js
rules: [
    {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
            fakeoption: true
        }
    }
]
```

我们用这种语法来为 babel-loader 设置几个选项

```js
rules: [
    {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
            plugins: ['transform-runtime'],
            presets: ['es2015']
        }
    }
]
```

我们设置了 `presets` ，这样所有的 ES2015的特性都会被编译为 ES5，我们还设置了 transform-runtime 插件。上文提到，这个插件不是必需的，在这里只是展示如何使用它。另一种方式是使用 `.babelrc` 来配置这些选项，但这样我就不能给你们展示如何在 webpack 中配置了。通常来说，我还是建议使用 `.babelrc`，但在我们的项目中还是保持在 webpack 中配置。

还有一件配置需要告诉 babel-loader。我们需要告诉 babel 不要处理 `node_modules` 目录，这样可以提高打包速速。增加 `exclude` 选项，告诉 loader 不要处理这个目录下的文件。`exclude` 也是一个正则表达式，所以我们设置为 `/node_modules/`：

```js
rules: [
    {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
            plugins: ['transform-runtime'],
            presets: ['es2015']
        }
    }
]
```

此外，也可以使用 `include` 的属性，表示我们只是用 `src` 目录，不过我想还是先不这么做。重新执行 `npm start`，得到可以在浏览器运行的 ES5 代码。如果你决定使用 `babel-polyfill` 代替 transform-runtime 插件，你需要做一些改变。首先，删除 `plugins: ['transform-runtime]`（如果之后你也不需要它了，可以通过 npm 卸载掉），然后修改 webpack 的 `entry`：

```js
entry: [
    'babel-polyfill',
    './src/main.js'
],
```

我们使用一个数组声明了多入口文件，而不是单一入口，新的入口文件就是这个 polyfill。这样就可以使得 polyfill 在打包文件之前，这样就保证了在我们处理代码之前，polyfill是存在的。

如果不在配置文件中配置，我们需要在 `src/main.js` 的文件头部添加一行 `import 'babel-polyfill;`，和在配置文件中效果是一样的。我之所以放在配置文件中是因为在最后一个例子中会用到，并且这也是一个展示合并多个入口文件到一个文件的好例子。好了，这就是 `example3` 分支的所有内容，再一次运行 `npm start` 验证一下。

## 使用 Handlebars Loader

让我们添加另外一个 loader：Handlebars loader，Handlebars loader会把模板编译为一个方法，当你引入一个 handlebars 模板的时候，这个编译后的方法会被引入 JavaScript 文件中，这也是我喜欢 loaders 的一个原因：你可以引入非 JavaScript 文件，当它们全部打包后，可以和 JavaScript 以前使用。另一个例子是你可以使用 loader 引入一个图片，并且可以把图片转换为 base64 编码的 url，JavaScript 就可以把它内联到页面中。如果你把多个 loader 串联起来，其中一个 loader 甚至可以对图片进行优化到一个比较小的尺寸。

通常来说，首先需要安装 loader：`npm install -D handlebars-loader`。使用之前，要先安装 HandleBars：`npm install -D handlebars`。这样你就可以控制 Handlebars 的版本，而不用去同步 loader 的版本，做到单独升级。

现在我们都安装了，在`src`目录下创建一个 `numberlist.hbs` 模板文件：
*译者注：因为模板会导致博客解析错误，所以我给两个大括号之前加了斜线。。。*

```html
<ul>
  {\{#each numbers as |number i|}}
    <li>{{number}}</li>
  {\{/each}}
</ul>
```

这个模板接受一个数组（从变量名字来看是个数字，当然不是数字也能用），创建一个无序的列表。

现在调整 JavaScript 文件，使用这个模板输出一个列表，而不是仅仅打印到控制台上，`main.js` 现在看起来是这样：

```js
import { map } from 'lodash';
import template from './numberlist.hbs';

let numbers = map([1,2,3,4,5,6], n => n*n);

console.log(template({numbers}));
```

遗憾的是，现在并不能正常工作，因为 webpack 不能识别 `numberslist.hbs`，它不是 JavaScript 文件。我们可以在 `import` 语句中添加一点东西来使用 Handlebars loader：

```js
import { map } from 'lodash';
import template from 'handlebars-loader!./numberlist.hbs';

let numbers = map([1,2,3,4,5,6], n => n*n);

console.log(template({numbers}));
```

通过在文件路径的前面加一个 loader 的名字，用惊叹号分割开，这样 webpack 就能使用 loader 来处理这个文件了。这样做的话，我们不用在配置文件中做任何事情。然而，在一个大型项目中，你可能加载多个模板，所以在配置文件中做会更有效，这样就不用对每个加载的模板路径前面加上 `handlebars!`，更新配置为：

```js
rules: [
    {/* babel loader config… */},
    { test: /\.hbs$/, loader: 'handlebars-loader' }
]
```

很简单。我们要做的就是告诉 webpack 使用 handlerbars-loader 来处理所有 `.hbs` 后缀的文件。这样我们就做完了 `example4` 分支中的所有事情，现在运行 `npm start`，你会看见 webpack 打包输出：

```html
<ul>
<li>1</li>
<li>4</li>
<li>9</li>
<li>16</li>
<li>25</li>
<li>36</li>
</ul>
```

---

文章是在太长，分成上下两部分。
原文地址：[A Detailed Introduction To Webpack](https://www.smashingmagazine.com/2017/02/a-detailed-introduction-to-webpack/)













