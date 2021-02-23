# BiliBot

bilibot是一个可以监控bilibiliUP直播以及动态的QQ机器人，并附有关键词回复等功能

## 二代目

在使用的酷Q框架关闭后，BiliBot二代目使用了另外一个框架——mirai

BiliBot二代目使用的有：

mirai：https://github.com/mamoe/mirai

mirai-http-api：https://github.com/project-mirai/mirai-api-http

node-mirai-sdk：https://github.com/RedBeanN/node-mirai

# 环境配置

## Java

mirai运行需要java环境，所以首先要安装java环境

### linux之ubuntu安装java

进入ubuntu终端后在命令行输入`sudo apt install openjdk-11-jdk`

![apt安装openjdk8](E:\biliBot\images\apt安装openjdk11.png)

安装成功后输入`java -version`查看java版本，判断java是否安装成功

![java版本](E:\biliBot\images\java版本.png)

## node

BiliBot二代目开发使用的框架为node的mirai-http-api插件，所以需要安装node.js

# 运行

## 安装mirai

找到mirai文件夹，根据你的操作系统选择“mcl-installer-1.0.1-linux-amd64”或是“mcl-installer-1.0.1-windows-amd64.exe”，运行后再根据电脑的环境选择对应的版本

### window系统安装mcl

将“mcl-installer-1.0.1-windows-amd64.exe”放入向要安装mirai的文件夹中运行，再根据系统环境的选择对应的mirai安装包

![windows安装mirai1](E:\biliBot\images\windows安装mirai1.png)

![windows安装mirai2](E:\biliBot\images\windows安装mirai2.png)

### linux之ubuntu安装mcl

在ubuntu终端进入将要安装mirai的文件夹输入以下命令：

```bash
curl -LJO https://github.com/iTXTech/mcl-installer/releases/download/v1.0.2/mcl-installer-1.0.2-linux-amd64
sudo chmod +x mcl-installer-1.0.2-linux-amd64
sudo ./mcl-installer-1.0.2-linux-amd64
```

![linux安装mirai](E:\biliBot\images\linux安装mirai1.png)

再根据系统的环境选择对应的mirai安装包

![linux安装mirai2](E:\biliBot\images\linux安装mirai2.png)

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

接着安装mirai-api-http：退出mirai，将mirai文件夹中的“mirai-api-http-v1.9.8.mirai.jar”放入“/mirai安装文件夹/plugins”文件夹，再运行mcl就能使用mirai-http了

![mirai-apt-htpp成功运行](E:\biliBot\images\mirai-apt-htpp成功运行.png)

接下来再对mirai-api-http进行配置,进入文件夹”/mirai的安装文件夹/config/net.mamoe.mirai-api-http/“，修改”setting.yml”配置文件中的authKey等信息

![mirai-api-http的配置](E:\biliBot\images\mirai-api-http的配置.png)

## 运行main.js

根据mirai的配置，对main.js的配置进行自定义。接着在命令行中输入“node main.js”即可运行bot

# 其它

后台运行mcl`sudo nohup ./mcl >dev/null 2>&1 &`

linux安装包`sudo npm install --registry=https://registry.npm.taobao.org --unsafe-perm`