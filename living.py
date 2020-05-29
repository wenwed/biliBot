from json import loads,dumps
import requests
import random
import time
import sqlite3
import initDatabase


headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
    }

#查看up主是否直播
def liveRoom():
    rooms = {}
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    for row in c.execute("SELECT AID,Live_Start_Time FROM UP"):
        rooms[row[0]] = row[1]
    conn.commit()
    conn.close()
    for roomID,startTime in rooms.items():
        living(roomID,startTime)

def living(roomID, startTime):
    url = "https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id={}".format(roomID)
    res = requests.get(url,headers)
    if(loads(res.text)['code'] == -400):
        return ''
    info = loads(res.text)['data']
    live_status = info["room_info"]["live_status"]
    start = info["room_info"]["live_start_time"]
    if(live_status == 1) and (start != startTime):
        conn = sqlite3.connect('robot.db', 30.0)
        c = conn.cursor()
        c.execute("UPDATE UP SET Live_Start_Time=? WHERE AID=?",(start,roomID))
        print("更新直播开始时间成功",end='')
        for row in c.execute("SELECT Group_Number FROM subGroup,UP WHERE UP.UID=subGroup.UID AND UP.AID=? AND subGroup.Sub_Type=?",(roomID,1)):
            handleGroupLiving(info,row[0])
        for row in c.execute("SELECT Group_Number FROM subGroup,UP WHERE UP.UID=subGroup.UID AND UP.AID=? AND subGroup.Sub_Type=?",(roomID,3)):
            handleGroupLiving(info,row[0])
        for row in c.execute("SELECT Person_Number FROM subPerson,UP WHERE UP.UID=subPerson.UID AND UP.AID=? AND subPerson.Sub_Type=?",(roomID,1)):
            handlePersonLiving(info,row[0])
        for row in c.execute("SELECT Person_Number FROM subPerson,UP WHERE UP.UID=subPerson.UID AND UP.AID=? AND subPerson.Sub_Type=?",(roomID,3)):
            handlePersonLiving(info,row[0])
        conn.commit()
        conn.close()
    else:
        return ''

def handleGroupLiving(info,groupID):
    try:
        room = info["room_info"]
        up = info["anchor_info"]["base_info"]["uname"]
        data = {
            'group_id': groupID,
            "message":'你关注的'+ up + "开播啦！" + room["title"] + '，地址：https://live.bilibili.com/' + str(room["room_id"]),
            "auto_escape": False}
        group_send_url = "http://127.0.0.1:5700/send_group_msg"

        res = requests.post(group_send_url, data=data)
        return res
    except Exception as e:
        print(e)
        return e

def handlePersonLiving(info,personID):
    try:
        room = info["room_info"]
        up = info["anchor_info"]["base_info"]["uname"]
        data = {
            'user_id': personID,
            "message":'你关注的'+ up + "开播啦！" + room["title"] + '，地址：https://live.bilibili.com/' + str(room["room_id"]),
            "auto_escape": False}
        private_send_url = "http://127.0.0.1:5700/send_private_msg"

        res = requests.post(private_send_url, data=data)
        return res
    except Exception as e:
        print(e)
        return e

#查看up主是否发表新动态
def userDynamic():
    user = {}
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    for row in c.execute("SELECT UID,Last_Notice_Time FROM UP"):
        user[row[0]] = row[1]
    conn.commit()
    conn.close()
    for uid,noticeTime in user.items():
        dynamic(uid,noticeTime)

def dynamic(uid,noticeTime):
    url = "https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid={}".format(uid)
    res = requests.get(url,headers)
    res.encoding = "utf-8"
    js = loads(res.text)
    i = 0
    while(True):
        try:
            desc = js["data"]["cards"][i]["desc"]
            card = js["data"]["cards"][i]["card"]
            notice = desc["timestamp"]
            if(notice>noticeTime):
                res = process(desc, card)
                conn = sqlite3.connect('robot.db', 30.0)
                c = conn.cursor()
                newtime = int(time.time())
                c.execute("UPDATE UP SET Last_Notice_Time=? WHERE UID=?",(newtime,uid))
                print("更新动态查看时间成功",end='')
                conn.commit()
                for row in c.execute("SELECT Group_Number FROM subGroup,UP WHERE UP.UID=subGroup.UID AND UP.UID=? AND subGroup.Sub_Type=?",(uid,2)):
                    handleGroupDynamic(res,row[0])
                for row in c.execute("SELECT Group_Number FROM subGroup,UP WHERE UP.UID=subGroup.UID AND UP.UID=? AND subGroup.Sub_Type=?",(uid,3)):
                    handleGroupDynamic(res,row[0])
                for row in c.execute("SELECT Person_Number FROM subPerson,UP WHERE UP.UID=subPerson.UID AND UP.UID=? AND subPerson.Sub_Type=?",(uid,2)):
                    handlePersonDynamic(res,row[0])
                for row in c.execute("SELECT Person_Number FROM subPerson,UP WHERE UP.UID=subPerson.UID AND UP.UID=? AND subPerson.Sub_Type=?",(uid,3)):
                    handlePersonDynamic(res,row[0])
                conn.commit()
                conn.close()
                i = i+1
            else:
                break
        except Exception as e:
            print(e,end='')
            break
    return ''

def handleGroupDynamic(message,group):
    data = {
        'group_id': group,
        "message": message,
        "auto_escape": False}
    group_send_url = "http://127.0.0.1:5700/send_group_msg"

    res = requests.post(group_send_url, data=data)
    return res

def handlePersonDynamic(message,person):
    data = {
        'user_id': person,
        "message": message,
        "auto_escape": False}
                    
    private_send_url = "http://127.0.0.1:5700/send_private_msg"

    res = requests.post(private_send_url, data=data)
    return res

def process(desc, card):
    card = loads(card)
    dyamic_id = desc["dynamic_id"]
    typ = desc["type"]
    uname = desc["user_profile"]["info"]["uname"]

    #转发动态
    if(typ==1):
        pre_dy_id = desc["pre_dy_id"]
        orig_type = desc["orig_type"]
        content = card["item"]["content"]
        #转发带有图片的原创动态
        if(orig_type==2):
            res = uname + "转发了动态：\n"+"URL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+uname+"：\n"+content
            origin = loads(card["origin"])
            description = origin["item"]["description"]
            origin_name = origin["user"]["name"]
            res = res+"\n"+origin_name+"：\n"+description+"\nURL：https://t.bilibili.com/"+str(pre_dy_id)
        #转发原创纯文字动态
        elif(orig_type==4):
            res = uname + "转发了动态：\n"+"URL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+uname+"：\n"+content
            origin = loads(card["origin"])
            origin_name = origin["user"]["uname"]
            origin_content = origin["item"]["content"]
            res = res+"\n"+origin_name+"：\n"+origin_content+"\nURL：https://t.bilibili.com/"+str(pre_dy_id)
        #转发视频
        elif(orig_type==8):
            res = uname + "转发了视频：\n"+"URL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+content
            origin = loads(card["origin"])
            aid = origin["aid"]
            title = origin["title"]
            res = res+"\n"+title+"\nURL：https://www.bilibili.com/video/av"+str(aid)
        #转发直播间
        elif(orig_type==4200):
            res = uname + "转发了直播间：\n"+"URL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+content
            origin = loads(card["origin"])
            rid = origin["roomid"]
            title = origin["title"]
            res = res+"\n"+title+" URL：https://live.bilibili.com/"+str(rid)
        #转发专栏
        elif(orig_type==64):
            res = uname + "转发了专栏：\n"+"URL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+content
            origin = loads(card["origin"])
            rid = origin["id"]
            title = origin["title"]
            res = res+"\n"+title+"\nURL：https://www.bilibili.com/read/cv"+str(rid)
        #转发收藏夹
        elif(orig_type==4300):
            res = uname + "转发了收藏夹：\n"+"URL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+content
        #转发发表使用挂件的动态
        elif(orig_type==2048):
            res = uname + "转发了动态：\n"+"URL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+content
            origin = loads(card["origin"])
            origin_content = origin["vest"]["content"]
            res = res+"\n"+origin_content+"\nURL：https://t.bilibili.com/"+str(pre_dy_id)
        #转发原动态已失效
        elif(orig_type==1024):
            res = uname + "转发了动态：\n"+"URL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+content
            tips = card["item"]["tips"]
            res = res+"\nURL：https://t.bilibili.com/"+str(dyamic_id)+"\n"+tips
    #原创图片动态
    elif(typ==2):
        description = card["item"]["description"]
        res = uname+"发表了新动态：\n"+description+"\nURL：https://t.bilibili.com/"+str(dyamic_id)
    #原创文字动态
    elif(typ==4):
        content = card["item"]["content"]
        res = uname+"发表了新动态：\n"+content+"\nURL：https://t.bilibili.com/"+str(dyamic_id)
    #发表视频
    elif(typ==8):
        BVID = desc["bvid"]
        title = card["title"]
        res = uname+"发表了新视频：\n"+title+"\nURL：https://www.bilibili.com/video/"+str(BVID)
    #发表使用挂件的动态
    elif(typ==2048):
        content = card["vest"]["content"]
        res = uname+"发表了新动态：\n"+content+"\nURL：https://t.bilibili.com/"+str(dyamic_id)
    #发表专栏
    elif(typ==64):
        title = card["title"]
        rid = card["id"]
        res = uname+"发表了新的专栏：\n"+title+"\nURL：https://www.bilibili.com/read/cv"+str(rid)
    return(res)


if __name__ == '__main__':
    initDatabase.init()
    while(True):
        liveRoom()
        userDynamic()
        time.sleep(120)
