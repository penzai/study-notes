(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{362:function(s,a,t){"use strict";t.r(a);var e=t(42),r=Object(e.a)({},(function(){var s=this,a=s.$createElement,t=s._self._c||a;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h2",{attrs:{id:"linux"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#linux"}},[s._v("#")]),s._v(" Linux")]),s._v(" "),t("h3",{attrs:{id:"目录结构"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#目录结构"}},[s._v("#")]),s._v(" 目录结构")]),s._v(" "),t("ul",[t("li",[t("code",[s._v("/bin")]),s._v(" 基本执行命令")]),s._v(" "),t("li",[t("code",[s._v("/sbin")]),s._v(" 系统管理命令")]),s._v(" "),t("li",[t("code",[s._v("/dev")]),s._v(" 设备文件目录，特殊文件目录")]),s._v(" "),t("li",[t("code",[s._v("/etc")]),s._v(" 配置文件目录")]),s._v(" "),t("li",[t("code",[s._v("/opt")]),s._v(" 第三方软件安装的目录")]),s._v(" "),t("li",[t("code",[s._v("/usr")]),s._v(" 第三方软件的管理命令、额外信息等都存放在此")])]),s._v(" "),t("h3",{attrs:{id:"常用命令"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#常用命令"}},[s._v("#")]),s._v(" 常用命令")]),s._v(" "),t("ul",[t("li",[s._v("打包: tar -zcvf 目标包名 目标文件夹")]),s._v(" "),t("li",[s._v("解压: tar -xzvf 目标包名")]),s._v(" "),t("li",[s._v("ssh 传送: scp crm.tar.gz root@118.24.23.200:/data/kyhs-crm")])]),s._v(" "),t("h3",{attrs:{id:"安装图形界面"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#安装图形界面"}},[s._v("#")]),s._v(" 安装图形界面")]),s._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v('yum groupinstall "X Window System"\nyum groupinstall "GNOME Desktop"\nsystemctl set-default graphical.target\n')])])]),t("h3",{attrs:{id:"samba共享"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#samba共享"}},[s._v("#")]),s._v(" "),t("code",[s._v("samba")]),s._v("共享")]),s._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("//安装\nyum install -y samba\n// 修改共享目录权限\nsudo chmod 777 需要共享的目录\n// 备份配置文件\nsudo cp /etc/samba/smb.conf /etc/samba/smb.conf.bak\n// 修改配置文件，在末尾添加\n// \"[share]\n// path=/home/share\n// available = yes\n// browseable = yes\n// public = yes\n// writable = yes\"\nsudo vim /etc/samba/smb.conf\n// 添加账户\nsudo touch /etc/samba/smbpasswd\nsudo smbpasswd -a USER_NAME\n// 启动服务\nservice smb start\n\n\n// 共享文件设置\nchcon -t samba_share_t 共享目录\nchmod 777 共享目录\n\n// 安装图形界面\n//'http://archives.fedoraproject.org/pub/archive/fedora/linux/releases/14/Everything/source/SRPMS/system-config-samba-1.2.90-1.fc14.src.rpm'\n//http://archives.fedoraproject.org/pub/archive/fedora/linux/releases/14/Everything/source/SRPMS/system-config-samba-docs-1.0.9-1.fc14.src.rpm\n// 安装编译工具\nyum install -y rpm-build\n// 开始编译\nrpmbuild --rebuild system-config-samba-0.99.47-1.fc14.src.rpm\nrpmbuild --rebuild system-config-samba-docs-1.0.9-1.fc14.src.rpm\n// 切换到编译好的目录\ncd /root/rpmbuild/RPMS/noarch/\n// 开始安装\nrpm -ivh system-config-samba-1.2.90-1.el7.centos.noarch.rpm system-config-samba-docs-1.0.9-1.el7.centos.noarch.rpm\n// 打开界面\nsystem-config-samba\n")])])]),t("h3",{attrs:{id:"ssh-登录免密"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#ssh-登录免密"}},[s._v("#")]),s._v(" ssh 登录免密")]),s._v(" "),t("p",[s._v("生成一对密钥，“文件名”和“文件名.pub”")]),s._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("ssh-keygen -f 文件名 -C 注释\n")])])]),t("p",[s._v("把公钥传到要登录的服务器上的~/.ssh 目录下")]),s._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("scp 文件名.pub 用户名@\b服务器地址:~/.ssh\n")])])]),t("p",[s._v("写入")]),s._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("cd ~/.ssh\ncat id_rsa.pub >> authorized_keys\n")])])]),t("h2",{attrs:{id:"mysql"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#mysql"}},[s._v("#")]),s._v(" mysql")]),s._v(" "),t("h3",{attrs:{id:"卸载"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#卸载"}},[s._v("#")]),s._v(" 卸载")]),s._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("sudo apt-get remove mysql-*\ndpkg -l |grep ^rc|awk '{print $2}' |sudo xargs dpkg -P\n")])])]),t("h3",{attrs:{id:"安装"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#安装"}},[s._v("#")]),s._v(" 安装")]),s._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("wget https://dev.mysql.com/get/mysql-apt-config_0.8.11-1_all.deb\n\nsudo dpkg -i mysql-apt-config_w.x.y-z_all.deb\n\nsudo apt-get update\n\nsudo apt-get install mysql-server\n")])])])])}),[],!1,null,null,null);a.default=r.exports}}]);