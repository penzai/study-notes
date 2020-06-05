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

尽量使用`git pull --rebase`，这样会使新的远程记录在你现有记录之前，从而避免丑陋的 mergexxxx。

### merge

- 为了处理一个问题，新建了 A 分支，有 3 条 commit。现在需要在 dev 分支上合并 A，使用 `git merge --squash`，可以将 A 分支所有的记录处理为待提交状态，你只需要填写本次 commit 信息（3 条 commit 不再存在于 dev 分支）。
- 合并另一个分支的改动时，有时 git 会使用快进方式合并。为了保留合并的历史，使用 `git merge --no-ff`，让其强行关闭 fast-forward 方式。

### stash

```
git stash
git stash pop
```

### rebase + merge

```
git checkout 你开发的分支
git rebase master

git checkout master
git merge 你开发的分支
```

### 修改历史 commit

1.运行命令弹出历史提交信息，

```
git rebase -i master~5
```

2.修改历史那一条的 pick 字段为 edit 字段，此时修改那一条历史变为最近一次提交，然后修改 3.回到如初

```
git rebase --continue
```

> 灵活运用 git stash 与 git stash pop 更方便对历史 commit 进行修改

### log

- --oneline 压缩一行
- --decorate 标记会让 git log 显示每个 commit 的引用(如:分支、tag 等)
- --graph 图形化显示
- --all 显示所有
- --p -2 查看最新 2 条的细节变动
- --stat -2 查看最新 2 条的文件变动
