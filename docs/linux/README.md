## Linux

### 目录结构

- `/bin` 基本执行命令
- `/sbin` 系统管理命令
- `/dev` 设备文件目录，特殊文件目录
- `/etc` 配置文件目录
- `/opt` 第三方软件安装的目录
- `/usr` 第三方软件的管理命令、额外信息等都存放在此

### 常用命令

- 打包: tar -zcvf 目标包名 目标文件夹
- 解压: tar -xzvf 目标包名
- ssh 传送: scp crm.tar.gz root@118.24.23.200:/data/kyhs-crm

### 安装图形界面

```
yum groupinstall "X Window System"
yum groupinstall "GNOME Desktop"
systemctl set-default graphical.target
```

### `samba`共享

```
//安装
yum install -y samba
// 修改共享目录权限
sudo chmod 777 需要共享的目录
// 备份配置文件
sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.bak
// 修改配置文件，在末尾添加
// "[share]
// path=/home/share
// available = yes
// browseable = yes
// public = yes
// writable = yes"
sudo vim /etc/samba/smb.conf
// 添加账户
sudo touch /etc/samba/smbpasswd
sudo smbpasswd -a USER_NAME
// 启动服务
service smb start


// 共享文件设置
chcon -t samba_share_t 共享目录
chmod 777 共享目录

// 安装图形界面
//'http://archives.fedoraproject.org/pub/archive/fedora/linux/releases/14/Everything/source/SRPMS/system-config-samba-1.2.90-1.fc14.src.rpm'
//http://archives.fedoraproject.org/pub/archive/fedora/linux/releases/14/Everything/source/SRPMS/system-config-samba-docs-1.0.9-1.fc14.src.rpm
// 安装编译工具
yum install -y rpm-build
// 开始编译
rpmbuild --rebuild system-config-samba-0.99.47-1.fc14.src.rpm
rpmbuild --rebuild system-config-samba-docs-1.0.9-1.fc14.src.rpm
// 切换到编译好的目录
cd /root/rpmbuild/RPMS/noarch/
// 开始安装
rpm -ivh system-config-samba-1.2.90-1.el7.centos.noarch.rpm system-config-samba-docs-1.0.9-1.el7.centos.noarch.rpm
// 打开界面
system-config-samba
```

### ssh 登录免密

生成一对密钥，“文件名”和“文件名.pub”

```
ssh-keygen -f 文件名 -C 注释
```

把公钥传到要登录的服务器上的~/.ssh 目录下

```
scp 文件名.pub 用户名@服务器地址:~/.ssh
```

写入

```
cd ~/.ssh
cat id_rsa.pub >> authorized_keys
```

## mysql

### 卸载

```
sudo apt-get remove mysql-*
dpkg -l |grep ^rc|awk '{print $2}' |sudo xargs dpkg -P
```

### 安装

```
wget https://dev.mysql.com/get/mysql-apt-config_0.8.11-1_all.deb

sudo dpkg -i mysql-apt-config_w.x.y-z_all.deb

sudo apt-get update

sudo apt-get install mysql-server
```
