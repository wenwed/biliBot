# BiliBot

bilibot是一个可以监控bilibiliUP直播以及动态的QQ机器人，并附有关键词回复等功能

## 二代目

在使用的酷Q框架关闭后，BiliBot二代目使用了另外一个框架——mirai

BiliBot二代目使用的有：

mirai：https://github.com/mamoe/mirai

mirai-http-api：https://github.com/project-mirai/mirai-api-http

node-mirai-sdk：https://github.com/RedBeanN/node-mirai

# 环境配置

（README.pdf中有图文解说）

## Java

mirai运行需要java环境，所以首先要安装java环境

### linux之ubuntu安装java

进入ubuntu终端后在命令行输入`sudo apt install openjdk-11-jdk`

安装成功后输入`java -version`查看java版本，判断java是否安装成功

## node

BiliBot二代目开发使用的框架为node的mirai-http-api插件，所以需要安装node.js

### linux之ubuntu安装node

教程地址：https://www.cnblogs.com/niuben/p/12938501.html

1.进入将要安装node的文件夹，输入以下命令下载node安装包：

`wget https://nodejs.org/dist/v14.15.5/node-v14.15.5-linux-x64.tar.xz`

2.解压node安装包：

`tar -xvf node-v14.15.5-linux-x64.tar.xz`

3.配置软连接，全局都可以使用node

```bash
mv node-v14.15.5-linux-x64 node  // 修改解压包名称

ln -s /安装node的文件夹/node /usr/bin/node  --将node源文件映射到usr/bin下的node文件

ln -s /安装node的文件夹/node/bin/npm /usr/bin/npm
```

4.配置node文件安装路径

```bash
mkdir node_global

mkdir node_cache

npm config set prefix "node_global"

npm config set cache "node_cache"
```

5.查看node版本判断是否安装成功

```bash
node -v
```

# 运行

## 安装mirai

找到mirai文件夹，根据你的操作系统选择“mcl-installer-1.0.1-linux-amd64”或是“mcl-installer-1.0.1-windows-amd64.exe”，运行后再根据电脑的环境选择对应的版本

### window系统安装mcl

将“mcl-installer-1.0.1-windows-amd64.exe”放入向要安装mirai的文件夹中运行，再根据系统环境的选择对应的mirai安装包

### linux之ubuntu安装mcl

在ubuntu终端进入将要安装mirai的文件夹输入以下命令：

```bash
curl -LJO https://github.com/iTXTech/mcl-installer/releases/download/v1.0.2/mcl-installer-1.0.2-linux-amd64
sudo chmod +x mcl-installer-1.0.2-linux-amd64
sudo ./mcl-installer-1.0.2-linux-amd64
```

再根据系统的环境选择对应的mirai安装包

## 安装mirai-http-api

mirai安装完成后需要先运行一遍以生成“plugins”文件夹：

1.进入mirai的安装目录。

2.window系统需要在命令行中输入`.\mcl`运行mirai；

linux系统则要在命令行中输入以下命令行：

```bash
sudo chmod +x mcl
sudo ./mcl
```

3.运行mcl后，输入`/autologin add bot的QQ号 bot的密码`，添加自动登陆的QQ号

4.接着安装mirai-api-http：退出mirai，将mirai文件夹中的“mirai-api-http-v1.9.8.mirai.jar”放入“/mirai安装文件夹/plugins”文件夹，再运行mcl就能使用mirai-http了

5.再对mirai-api-http进行配置,进入文件夹”/mirai的安装文件夹/config/net.mamoe.mirai-api-http/“，修改”setting.yml”配置文件中的authKey等信息

## 运行main.js

1.根据mirai的配置，在main.js中对main.js的配置进行自定义。

2.接着安装node项目的依赖项：

```bash
sudo npm install --registry=https://registry.npm.taobao.org --unsafe-perm
```

3.接着在命令行中输入`node main.js`即可运行bot，输入`sudo nohup node main.js >dev/null 2>&1 &`可以后台运行bot且不使用输出日志

# 其它

后台运行mcl：`sudo nohup ./mcl >dev/null 2>&1 &`，可以不使用输入日志

剩下的开发目标：

1.复读模块

2.勋章查询模块

3.转发专栏