from flask import Flask,request
from json import loads,dumps,load
import requests
import random
import re
import sqlite3
import initDatabase
import biliMedal

bot_server = Flask(__name__)

def handle(data):
    try:
        #信息来源于群聊
        if data['message_type']=='group':
            message = data['raw_message']       #信息
            group = data['group_id']            #群号
            role = data['sender']['role']       #信息来源的角色
            if(message.find('!')==0):
                if(message=='!help'):
                    res = "!订阅 uid\n!订阅列表\n!直播订阅 uid\n!直播订阅列表\n"
                    res = res+"!动态订阅 uid\n!动态订阅列表\n!取消订阅 uid\n!勋章查询 uid\n\n"
                    res = res+"管理员权限：\n"+"!添加精确关键词 关键词 回复词\n!添加模糊关键词 关键词 回复词\n!删除关键词 关键词\n"
                    res = res+"!精确关键词列表\n!模糊关键词列表\n\n当前版本：2.1.0" 
                    sentGroupMessage(group, res)
                    return 0
                elif(message=='!订阅列表'):
                    res = initDatabase.selectGroupSub(group, 3)
                    sentGroupMessage(group, res)
                    return 0
                elif(message=='!直播订阅列表'):
                    res = initDatabase.selectGroupSub(group, 1)
                    sentGroupMessage(group, res)
                    return 0
                elif(message=='!动态订阅列表'):
                    res = initDatabase.selectGroupSub(group,2)
                    sentGroupMessage(group, res)
                    return 0
                elif(message.find('!订阅')==0):
                    uid = re.sub(r'!订阅', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = initDatabase.addGroupSub(uid, group, 3)
                    else:
                        res = "格式错误"
                    sentGroupMessage(group, res)
                    return 0
                elif(message.find('!直播订阅')==0):
                    uid = re.sub(r'!直播订阅', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = initDatabase.addGroupSub(uid, group, 1)
                    else:
                        res = "格式错误"
                    sentGroupMessage(group, res)
                    return 0
                elif(message.find('!动态订阅')==0):
                    uid = re.sub(r'!动态订阅', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = initDatabase.addGroupSub(uid, group, 2)
                    else:
                        res = "格式错误"
                    sentGroupMessage(group, res)
                    return 0
                elif(message.find('!取消订阅')==0):
                    uid = re.sub(r'!取消订阅', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = initDatabase.deleteGroupSub(uid, group)
                    else:
                        res = "格式错误"
                    sentGroupMessage(group, res)
                    return 0
                elif(message.find('!添加精确关键词')==0 and (role=='admin' or role=='owner')):
                    message = re.sub(r'!添加精确关键词', '', message)
                    message = message.strip()
                    message = message.split(" ",maxsplit=1)
                    if(len(message)==2):
                        res = initDatabase.addKeyWord(message[0], message[1], group, 1)
                    else:
                        res = "格式错误"
                    sentGroupMessage(group, res)
                    return 0
                elif(message.find('!添加模糊关键词')==0 and (role=='admin' or role=='owner')):
                    message = re.sub(r'!添加模糊关键词', '', message)
                    message = message.strip()
                    message = message.split(" ",maxsplit=1)
                    if(len(message)==2):
                        res = initDatabase.addKeyWord(message[0], message[1], group, 2)
                    else:
                        res = "格式错误"
                    sentGroupMessage(group, res)
                    return 0
                elif(message.find('!删除关键词')==0 and (role=='admin' or role=='owner')):
                    message = re.sub(r'!删除关键词', '', message)
                    message = message.strip()
                    if(message!=None):
                        res = initDatabase.deleteKeyWord(message, group)
                    else:
                        res = "格式错误"
                    sentGroupMessage(group, res)
                    return 0
                elif(message=='!精确关键词列表' and (role=='admin' or role=='owner')):
                    res = initDatabase.selectKeyWord(group, 1)
                    sentGroupMessage(group, res)
                    return 0
                elif(message=='!模糊关键词列表' and (role=='admin' or role=='owner')):
                    res = initDatabase.selectKeyWord(group, 2)
                    sentGroupMessage(group, res)
                    return 0
                elif(message.find('!勋章查询')==0):
                    uid = re.sub(r'!勋章查询', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = biliMedal.search(uid)
                    else:
                        res = "格式错误"
                    sentGroupMessage(group, res)
                    return 0
                else:
                    res = '命令格式错误或没有权限'
                    sentGroupMessage(group, res)
                    return 0

            #查询关键词
            conn = sqlite3.connect('robot.db',30.0)
            c = conn.cursor()
            #精确关键词
            for row in c.execute("SELECT Key_Word,Repair_Word FROM keyWords WHERE Group_Number=? AND Key_Type=?",(group,1)):
                if row[0]==message:
                    sentGroupMessage(group,row[1])
                    conn.commit()
                    conn.close()
                    return ''
            #模糊关键词
            for row in c.execute("SELECT Key_Word,Repair_Word FROM keyWords WHERE Group_Number=? AND Key_Type=?",(group,2)):
                if re.search(row[0],message)!=None:
                    sentGroupMessage(group,row[1])
                    conn.commit()
                    conn.close()
                    return ''
            conn.commit()
            conn.close()
            
            if(message=='奥利给'):
                ran = random.randint(0, 2)
                sentGroupMessage(group, bug[ran])
                return 0
                
            elif(message=='[CQ:at,qq='+str(botNum)+'] ' or message=='[CQ:at,qq='+str(botNum)+']'):
                ran = random.randint(0,len(lovewords)-1)
                sentGroupMessage(group, lovewords[ran])
                return 0
                
                
            else:
                ran = random.randint(1,80)
                if( ran ==1 ):
                    res = re.sub(r'你', '他', data['raw_message'])
                    res = re.sub(r'我', '你', res)
                    res = re.sub(r'bot', '我', res)
                    sentGroupMessage(group, res)
                return 0
        #信息来源于私聊           
        else:
            message = data['raw_message']
            user = data['user_id']
            if(message.find('!')==0):
                if(message=='!help'):
                    res = "!订阅 uid\n!订阅列表\n!直播订阅 uid\n!直播订阅列表\n"
                    res = res+"!动态订阅 uid\n!动态订阅列表\n!取消订阅 uid\n!勋章查询 uid\n\n当前版本：2.1.0"
                    sentPersonMessage(user, res)
                    return 0
                elif(message=='!订阅列表'):
                    res = initDatabase.selectPersonSub(user,3)
                    sentPersonMessage(user, res)
                    return 0
                elif(message=='!直播订阅列表'):
                    res = initDatabase.selectPersonSub(user,1)
                    sentPersonMessage(user, res)
                    return 0
                elif(message=='!动态订阅列表'):
                    res = initDatabase.selectPersonSub(user,2)
                    sentPersonMessage(user, res)
                    return 0
                elif(message.find('!订阅')==0):
                    uid = re.sub(r'!订阅', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = initDatabase.addPersonSub(uid, user, 3)
                    else:
                        res = "格式错误"
                    sentPersonMessage(user, res)
                    return 0
                elif(message.find('!直播订阅')==0):
                    uid = re.sub(r'!直播订阅', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = initDatabase.addPersonSub(uid, user, 1)
                    else:
                        res = "格式错误"
                    sentPersonMessage(user, res)
                    return 0
                elif(message.find('!动态订阅')==0):
                    uid = re.sub(r'!动态订阅', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = initDatabase.addPersonSub(uid, user, 2)
                    else:
                        res = "格式错误"
                    sentPersonMessage(user, res)
                    return 0
                elif(message.find('!取消订阅')==0):
                    uid = re.sub(r'!取消订阅', '', message)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = initDatabase.deletePersonSub(uid, user)
                    else:
                        res = "格式错误"
                    sentPersonMessage(user, res)
                    return 0
                elif(message.find('!勋章查询')==0):
                    uid = re.sub(r'!勋章查询', '', user)
                    uid = uid.strip()
                    if uid.isdigit()==True:
                        res = biliMedal.search(uid)
                    else:
                        res = "格式错误"
                    sentPersonMessage(user, res)
                    return 0
                else:
                    res = '命令格式错误'
                    sentPersonMessage(user, res)
                    return 0
            elif(user!=masterNum):
                person = user
                message = '三天之内鲨了你'
                sentPersonMessage(person, message)
    except Exception as e:
        print(e)
        return e
#发送群聊信息
def sentGroupMessage(group, message):
    data = {
        'group_id': group,
        "message": message,
        "auto_escape": False}
    group_send_url = "http://127.0.0.1:5700/send_group_msg"

    res = requests.post(group_send_url, data=data)
    return res
#发送私聊信息
def sentPersonMessage(person, message):
    data = {
        'user_id': person,
        "message": message,
        "auto_escape": False}
                    
    private_send_url = "http://127.0.0.1:5700/send_private_msg"

    res = requests.post(private_send_url, data=data)
    return res

#读取配置
def read_config():
    with open('config.json','rb') as config_file:
        config = load(config_file)
        global lovewords
        global bug
        global masterNum
        global botNum
        lovewords = config["lovewords"]
        bug = config["bug"]
        masterNum = config["master_num"]
        botNum = config["bot_num"]

@bot_server.route('/api/message',methods=['POST'])


def server():
    read_config()
    data = request.get_data().decode('utf-8')
    data = loads(data)
    handle(data)
    return ''

if __name__ == '__main__':
    initDatabase.init()
    bot_server.run(host='0.0.0.0',port=5701)
