# wenwd
bilibili直播动态提醒bot 此bot可以对B站UP主进行订阅，订阅后会在订阅的群聊或私人对话中提醒你关注的UP主的最新动态和开播提醒 使用的是酷qHTTP，下载地址：https://cqp.cc/t/30748 教程：https://zhuanlan.zhihu.com/p/96892167 通过 HTTP 对酷 Q 的事件进行上报以及接收 HTTP 请求来调用酷 Q 的 DLL 接口，从而可以使用其它语言编写酷 Q 插件。（酷q已关闭，提供了一个酷q的windows安装包）

biliMedal.py是爬取B站勋章的模块 initDatabase.py是预定义数据库以及进行数据库操作的模块 living.py是爬取B站直播和动态的模块 repair.py是处理QQ消息的模块

config中bot_num为登陆的qq的号码，master_num为你的qq号

运行时需要运行living.py和repair.py两个模块