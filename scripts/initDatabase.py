import sqlite3
from json import loads,dumps
import requests
import time

headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
    }
def init():
    conn = sqlite3.connect('robot.db', 30.0)
    print("Opened database successfully")
    c = conn.cursor()
    #创建up主表
    c.execute('''CREATE TABLE IF NOT EXISTS UP
            (UID TEXT PRIMARY KEY NOT NULL,
            Name TEXT NOT NULL,
            AID TEXT NOT NULL,
            Live_Status TEXT NOT NULL,
            Dynamic_ID_Str TEXT,
            Last_Notice_Time INTEGER,
            Live_Start_Time INTEGER  NOT NULL);''')
    #创建群关注up主表
    #Sub_Type：1为直播订阅，2为动态订阅，3为直播加动态订阅
    c.execute('''CREATE TABLE IF NOT EXISTS subGroup
            (UID TEXT NOT NULL,
            Group_Number TEXT NOT NULL,
            Sub_Type INTEGER,
            PRIMARY KEY(UID,Group_Number));''')
    #创建个人关注up主表
    c.execute('''CREATE TABLE IF NOT EXISTS subPerson
            (UID TEXT NOT NULL,
            Person_Number TEXT NOT NULL,
            Sub_Type INTEGER,
            PRIMARY KEY(UID,Person_Number));''')
    #创建关键词回复表
    c.execute('''CREATE TABLE IF NOT EXISTS keyWords
            (Group_Number TEXT NOT NULL,
            Key_Word TEXT NOT NULL,
            Repair_Word TEXT NOT NULL,
            Key_Type INTEGER NOT NULL,
            PRIMARY KEY(Key_Word,Group_Number));''')
    print("table created successfully")

    conn.commit()
    conn.close()

def addGroupSub(uid, GroupNum,subType):
    res = ''
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    cur = c.execute("SELECT * FROM subGroup WHERE UID=? AND Group_Number=? AND Sub_Type=?",(uid,GroupNum,subType))
    resLen = len(list(cur))
    if resLen == 0:
        cur = c.execute("SELECT * FROM subGroup WHERE UID=? AND Group_Number=?",(uid,GroupNum))
        resLen = len(list(cur))
        if(resLen==0):
            cursor = c.execute("SELECT Name FROM UP WHERE UID=?",(uid,))
            resLen = len(list(cursor))
            if resLen == 0:
                try:
                    upurl = "https://api.bilibili.com/x/space/acc/info?mid={}&jsonp=jsonp".format(uid)
                    upRes = requests.get(upurl,headers)
                    html = loads(upRes.text)
                    name = html["data"]["name"]
                    res = name
                    liveurl = "https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid={}".format(uid)
                    liveRes = requests.get(liveurl,headers)
                    html = loads(liveRes.text)
                    aid = html["data"]["roomid"]
                    liveStatus = html["data"]["liveStatus"]
                    livetime = int(time.time())
                    correntime = livetime
                    c.execute("INSERT INTO UP (UID,Name,AID,Live_Status,Live_Start_Time,Last_Notice_Time) \
                            VALUES (?,?,?,?,?,?)",(uid,name,aid,liveStatus,livetime,correntime))
                    c.execute("INSERT INTO subGroup (UID,Group_Number,Sub_Type) VALUES (?,?,?)",(uid,GroupNum,subType))
                    conn.commit()
                    conn.close()
                    return "订阅\"" + res + "\"成功"
                except Exception as e:
                    print(e)
                    conn.commit()
                    conn.close()
                    return "订阅出现错误"
            else:
                c.execute("INSERT INTO subGroup(UID,Group_Number,Sub_Type) VALUES(?,?,?)", (uid,GroupNum,subType))
                conn.commit()
                conn.close()
                return "订阅成功"
        else:
            c.execute("UPDATE subGroup SET Sub_Type=? WHERE Group_Number=? AND UID=?",(subType,GroupNum,uid))
            conn.commit()
            conn.close()
            return "订阅成功"
    else:
        conn.commit()
        conn.close();
        return "该群已订阅此up主"

def deleteGroupSub(uid, GroupNum):
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    cur = c.execute("SELECT * FROM subGroup WHERE UID=? AND Group_Number=?",(uid,GroupNum))
    curLen = len(list(cur))
    for row in c.execute("SELECT Name FROM UP WHERE UID=?",(uid,)):
        name = row[0]
    if(curLen!=0):
        res = c.execute("DELETE FROM subGroup WHERE UID=? AND Group_Number=?",(uid,GroupNum))
        cur = c.execute("SELECT * FROM subGroup WHERE UID=?",(uid,))
        groupLen = len(list(cur))
        cur = c.execute("SELECT * FROM subPerson WHERE UID=?",(uid,))
        personLen = len(list(cur))
        if groupLen==0 and personLen==0:
            c.execute("DELETE FROM UP WHERE UID=?",(uid,))
        conn.commit()
        conn.close()
        return "取消订阅\"" + name + "\"成功"
    else:
        conn.commit()
        conn.close()
        return "此群并未订阅该up主"

def selectGroupSub(GroupNum,subType):
    res = ''
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    index = 0
    for row in c.execute("SELECT UP.UID,UP.Name FROM subGroup,UP WHERE subGroup.Group_Number=? AND subGroup.UID=UP.UID AND Sub_Type=?",(GroupNum,subType)):
        index = index + 1
        res = res + "\n" + str(index) + "  " + row[0] + "  " + row[1]
    if(subType==1):
        res = "该群直播订阅了" + str(index) + "位up主" + res
    elif(subType==2):
        res = "该群动态订阅了" + str(index) + "位up主" + res
    elif(subType==3):
        res = "该群订阅了" + str(index) + "位up主" + res
    conn.commit()
    conn.close()
    return res

def addPersonSub(uid, PersonNum,subType):
    res = ''
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    cur = c.execute("SELECT * FROM subPerson WHERE UID=? AND Person_Number=? AND Sub_Type=?",(uid,PersonNum,subType))
    resLen = len(list(cur))
    if resLen == 0:
        cur = c.execute("SELECT * FROM subPerson WHERE UID=? AND Person_Number=?",(uid,PersonNum))
        resLen = len(list(cur))
        if(resLen==0):
            cursor = c.execute("SELECT Name FROM UP WHERE UID=?",(uid,))
            resLen = len(list(cursor))
            if resLen == 0:
                try:
                    upurl = "https://api.bilibili.com/x/space/acc/info?mid={}&jsonp=jsonp".format(uid)
                    upRes = requests.get(upurl,headers)
                    html = loads(upRes.text)
                    name = html["data"]["name"]
                    res = name
                    liveurl = "https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid={}".format(uid)
                    liveRes = requests.get(liveurl,headers)
                    html = loads(liveRes.text)
                    aid = html["data"]["roomid"]
                    liveStatus = html["data"]["liveStatus"]
                    livetime = int(time.time())
                    correntime = livetime
                    c.execute("INSERT INTO UP (UID,Name,AID,Live_Status,Live_Start_Time,Last_Notice_Time) \
                            VALUES (?,?,?,?,?,?)",(uid,name,aid,liveStatus,livetime,correntime))
                    c.execute("INSERT INTO subPerson (UID, Person_Number,Sub_Type) VALUES (?,?,?)",(uid,PersonNum,subType))
                    conn.commit()
                    conn.close()
                    return "订阅\"" + res + "\"成功"
                except Exception as e:
                    print(e)
                    conn.commit()
                    conn.close()
                    return "订阅出现错误"
            else:
                c.execute("INSERT INTO subPerson(UID,Person_Number,Sub_Type) VALUES(?,?,?)", (uid,PersonNum,subType))
                conn.commit()
                conn.close()
                return "订阅成功"
        else:
            c.execute("UPDATE subPerson SET Sub_Type=? WHERE Person_Number=? AND UID=?",(subType,PersonNum,uid))
            conn.commit()
            conn.close()
            return "订阅成功"
    else:
        conn.commit()
        conn.close();
        return "你已订阅此up主"

def deletePersonSub(uid, PersonNum):
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    cur = c.execute("SELECT * FROM subPerson WHERE UID=? AND Person_Number=?",(uid,PersonNum))
    curLen = len(list(cur))
    for row in c.execute("SELECT Name FROM UP WHERE UID=?",(uid,)):
        name = row[0]
    if(curLen!=0):
        res = c.execute("DELETE FROM subPerson WHERE UID=? AND Person_Number=?",(uid,PersonNum))
        cur = c.execute("SELECT * FROM subGroup WHERE UID=?",(uid,))
        groupLen = len(list(cur))
        cur = c.execute("SELECT * FROM subPerson WHERE UID=?",(uid,))
        personLen = len(list(cur))
        if groupLen==0 and personLen==0:
            c.execute("DELETE FROM UP WHERE UID=?",(uid,))
        conn.commit()
        conn.close()
        return "取消订阅\"" + name + "\"成功"
    else:
        conn.commit()
        conn.close()
        return "你并未订阅该up主"

def selectPersonSub(PersonNum,subType):
    res = ''
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    index = 0
    for row in c.execute("SELECT UP.UID,UP.Name FROM subPerson,UP WHERE subPerson.Person_Number=? AND subPerson.UID=UP.UID AND Sub_Type=?",(PersonNum,subType)):
        index = index + 1
        res = res + "\n" + str(index) + "  " + row[0] + "  " + row[1]
    if(subType==1):
        res = "你直播订阅了" + str(index) + "位up主" + res
    elif(subType==2):
        res = "你动态订阅了" + str(index) + "位up主" + res
    elif(subType==3):
        res = "你订阅了" + str(index) + "位up主" + res
    conn.commit()
    conn.close()
    return res

def addKeyWord(keyWord, repairWord, GroupNum,keyType):
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    cur = c.execute("SELECT * FROM keyWords WHERE Group_Number=? AND Key_Word=?",(GroupNum, keyWord))
    curLen = len(list(cur))
    if(curLen==0):
        c.execute("INSERT INTO keyWords (Group_Number,Key_Word,Repair_Word,Key_Type) \
                        VALUES (?,?,?,?)",(GroupNum,keyWord,repairWord,keyType))
        conn.commit()
        conn.close()
        return "添加关键词成功"
    else:
        conn.commit()
        conn.close()
        return "该关键词已添加"
        
def deleteKeyWord(keyWord, GroupNum):
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    cur = c.execute("SELECT * FROM keyWords WHERE Group_Number=? AND Key_Word=?",(GroupNum, keyWord))
    curLen = len(list(cur))
    if(curLen!=0):
        c.execute("DELETE FROM keyWords WHERE Group_Number=? AND Key_Word=?",(GroupNum, keyWord))
        conn.commit()
        conn.close()
        return "删除关键词成功"
    else:
        conn.commit()
        conn.close()
        return "该群未添加此关键词"

def selectKeyWord(GroupNum,keyType):
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    num = 1
    res = ''
    for row in c.execute("SELECT Key_Word,Repair_Word FROM keyWords WHERE Group_Number=? AND Key_Type=?",(GroupNum, keyType)):
        res = res + "\n" + str(num) + " " + row[0] + " " + row[1]
        num = num + 1
    if(keyType==1):
        res = "该群添加了如下精确关键词：" + res
    else:
        res = "该群添加了如下模糊关键词：" + res
    conn.commit()
    conn.close()
    return res
