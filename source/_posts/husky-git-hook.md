
layout: post
title: 哈士奇 是如何 HOOK 你的 Git 的
banner: assets/img/husky.jpg
tags:
- Git
---

哈士奇，蠢萌蠢萌的，我们常常用它来做 Git hook，哈哈哈。

## Git Hook

Git hook 是在 Git 仓库中特定动作（commit、push 等）发生时自动运行的脚本。在初始化仓库时，Git 会自动在仓库根目录下的 `.git/hooks` 创建一些示例的 hook 脚本：

```bash
applypatch-msg.sample       pre-push.sample
commit-msg.sample           pre-rebase.sample
post-update.sample          prepare-commit-msg.sample
pre-applypatch.sample       update.sample
pre-commit.sample
```

这些脚本后面带着 `.sample` 后缀，防止被执行，如果想启用他们，就去掉 `.sample` 后缀，根据需求修改脚本。

Hook 又分为客户端 hook 和服务端 hook，简单列一下比较常用的：

客户端 hook：

* pre-commit：钩子在键入提交信息前运行，它用于检查即将提交的快照。比如 lint 代码.
* prepare-commit-msg：编辑提交者所看到的默认信息。
* commit-msg：用户输入提交信息之后被调用。
* post-commit：在整个提交过程完成后运行，它无法更改 git commit 的结果，所以这主要用于通知用途。
* post-checkout：在 git checkout 成功运行后

服务端 hook：

* pre-receive：处理来自客户端的推送操作时，最先被调用的脚本是 pre-receive。
* post-receive：在整个过程完结以后运行，可以用来更新其他系统服务或者通知用户。

在 Git 相应动作发生时，就会触发对应的 hook，这些 hook 脚本就会执行，脚本以非0状态退出会放弃提交（或推送）。而且可以使用任何你喜欢的语言来编写 hook。比如打印 commit-msg 这个 hook 的参数：

```bash
# bash
# #!/usr/bin/bash
echo "$1"
# 输出 .git/COMMIT_EDITMSG
```

```js
#!/usr/bin/env node

// nodejs

console.log(process.argv[2])
```

那比如我们要对 git commit msg 进行规范，必须以 issue 开头：

```js
#!/usr/bin/env node

const msgPath = process.argv[2]
const fs = require('fs')
const content = fs.writeFileSync(msgPath, 'utf-8')
if(!content || content.indexOf('#issue') !== 0) {
    console.log('>>> 错误信息')
    console.log('提交信息需要包含 issue 信息')
    process.exit(1);
}
process.exit(0);
```

服务端的 hook 可以做很多事情，自动触发单元测试，自动部署等。

## husky

那为什么我们需要 husky 呢？因为克隆某个版本库时，它的客户端钩子并不随同复制。同时，对于前端项目，如果能和 `npm script` 相结合的话，就再好不过了。

相信很多团队都已经用过 husky了，配置也是很简单：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm test",
      "...": "..."
    }
  }
}
```

## husky 原理

1. install husky 时，husky 在 .git/hooks 下生成所有的客户端 hook，每个钩子的代码都一样：

```sh
# 以  commit-msg 为例
scriptPath="node_modules/husky/run.js"
# $0 本身 .git/hooks/commit-msg
# hookName = commit-msg
hookName=`basename "$0"`  
# gitParams = .git/COMMIT_EDITMSG
gitParams="$*" 

node_modules/run-node/run-node "$scriptPath" $hookName "$gitParams"
```

作用就是找到对应的 hook，把 hook 的名称和 hook 传入脚本的参数，传入 husky 的一段nodejs 脚本并执行。

2. husky 设置 HUSKY_GIT_PARAMS
3. 从 package.json 获取 hookName 对应的 hooks 命令并执行

```js
if (command) {
  console.log(`husky > ${hookName} (node ${process.version})`)
  execa.shellSync(command, { cwd, env, stdio: 'inherit' })
  return 0
}
```

原理其实并不复杂，但构思十分巧妙。




