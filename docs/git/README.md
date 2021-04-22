# git

## 概览图

![](~images/git/git.png)

## 规范提交

### 安装插件

安装后，即可使用 git cz 进行快速提交

```
npm i -g commitizen

commitizen init cz-conventional-changelog --save --save-exact
```

### 提交时检测

```
npm i -D validate-commit-msg husky
```

安装后在 package.json 中的 scripts 字段中添加下列字段，提交时，不符合规定的 commit msg 不给与提交

```
"commitmsg": "validate-commit-msg"
```

## 常用基础操作

```
# 查看用户信息
git config user.name
git config user.email

# 更改用户信息
git config --global user.name '修改后用户名'
git config --global user.email '修改后邮箱'

# 克隆（默认master分支）
git clone 地址 -b 分支名字


# 修改最后一次提交记录，--no-edit表示不修改提交备注
git commit --amend

# 让工作控件回到某个commit，--hard表示强制，并且会清空所有改动！！！未受版本控制的文件除外。
git reset hash值
```

### branch

- `git branch -a` 查看远程分支
- `git branch -vv` 可查看各个分支与远程分支的关联情况。
- `git checkout -b 新分支名字` 新建并切换到该分支
- `git checkout -b 新分支名字 远程服务器/远程分支` 新拉取远程分支并切换到该分支
  > 新分支上传到远程，直接`git push origin 新的本地分支名字`
- `git branch -D 本地分支名字` 删除本地分支
- `git push orgin :远程分支名字` 删除远端分支
- `git push origin 本地分支:远程分支` 推送本地分支到远程分支
- `git branch --set-upstream-to 远程分支` 连接分支到远程分支

### pull
git fetch与git merge的组合
### merge

- 为了处理一个问题，新建了 A 分支，有 3 条 commit。现在需要在 dev 分支上合并 A，使用 `git merge --squash`，可以将 A 分支所有的记录处理为待提交状态，你只需要填写本次 commit 信息（3 条 commit 不再存在于 dev 分支）。
> 注意这里与git rebase -i的区别，使用merge + squash会更改作者为操作者而不是提交者，而rebase会保留commit的真实提交者。
- 合并另一个分支的改动时，有时 git 会使用快进方式合并。为了保留合并的历史，使用 `git merge --no-ff`，让其强行关闭 fast-forward 方式。

### rebase
变基。使当前分支的基础变成最新的改动，这里与git pull的区别是，pull是简单的合并，会产生merge from xxx的commit，以及非线性的提交记录。而rebase不会。因为pull也有快捷操作`git pull --rebase`。

另外也可以用于编辑还未push的commit，你可以整合commit、修改commit信息等操作，使用`git rebase -i HEAD~5`。

### stash

```
git stash
git stash pop
```
### log

- --oneline 压缩一行
- --decorate 标记会让 git log 显示每个 commit 的引用(如:分支、tag 等)
- --graph 图形化显示
- --all 显示所有
- --p -2 查看最新 2 条的细节变动
- --stat -2 查看最新 2 条的文件变动

### 初次上传本地项目到git
```
# 链接远程
git remote add origin https://github.com/penzai/test-upload-git

# 上传
git push --set-upstream origin master
```

### 工作流
#### Git flow
最早的工作流，以master为总线，develop分支做版本开发，开发结束后就合并到master分支。

常常会出现一些额外分支：
- 功能分支（feature branch）
- 修复bug（hotfix branch）
- 预发分支（release branch）

缺点是，不利于持续发布，一有改动就部署那种（因为这样的话master和开发分支就没什么区别了）。
#### Github flow
依然以master作为总线，当有任何改动结束后，就以pr的形式请求合并。

缺点是，不利于版本发布。

> 编者注：其实版本release后依然可以根据此分支来进行bug修复再pr，不知道为什么阮一峰老师这篇文章要这么说。这种方式，我觉得其实更适合于双方陌生人的情况，毕竟有个review的过程。
#### Gitlab flow
依然以master作为总线，但是强调“上游”的规则，意思就是其他分支和版本都是由master生成出来。
