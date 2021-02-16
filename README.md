# BiliBot二代目

在使用的酷Q框架关闭后，BiliBot二代目使用了另外一个框架——mirai

BiliBot二代目使用的有：

mirai：https://github.com/mamoe/mirai

mirai-http-api：https://github.com/project-mirai/mirai-api-http

node-mirai-sdk：https://github.com/RedBeanN/node-mirai

# 环境配置

## Java

mirai运行需要java环境，所以首先要安装java环境

## node

BiliBot二代目开发使用的框架为node的mirai-http-api插件，所以需要安装node.js

# 运行

## 安装mirai

找到mirai文件夹，根据你的操作系统选择“mcl-installer-1.0.1-linux-amd64”或是“mcl-installer-1.0.1-windows-amd64.exe”，运行后再根据电脑的环境选择对应的版本

## 安装mirai-http-api

mirai安装完成后需要先运行一遍，进入mirai的安装目录，在命令行中输入“.\mcl”运行mirai。

接着退出mirai，再将mirai文件夹中的“mirai-api-http-v1.9.8.mirai.jar”放入mirai安装目录中的“plugins”

## 运行main.js

根据mirai的配置，对main.js的配置进行自定义。接着在命令行中输入“node main.js”即可运行bot