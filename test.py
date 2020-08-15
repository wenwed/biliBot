import sqlite3

def living_test():
    rooms = {}
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    for row in c.execute("SELECT AID,Live_Start_Time FROM UP,subGroup WHERE subGroup.UID=UP.UID AND subGroup.Sub_Type=1"):
        rooms[row[0]] = row[1]
    for row in c.execute("SELECT AID,Live_Start_Time FROM UP,subGroup WHERE subGroup.UID=UP.UID AND subGroup.Sub_Type=3"):
        rooms[row[0]] = row[1]
    for row in c.execute("SELECT AID,Live_Start_Time FROM UP,subPerson WHERE subPerson.UID=UP.UID AND subPerson.Sub_Type=1"):
        rooms[row[0]] = row[1]
    for row in c.execute("SELECT AID,Live_Start_Time FROM UP,subPerson WHERE subPerson.UID=UP.UID AND subPerson.Sub_Type=3"):
        rooms[row[0]] = row[1]
    conn.commit()
    conn.close()
    for roomID,startTime in rooms.items():
        print(roomID, startTime)

def dynamic_test():
    user = {}
    conn = sqlite3.connect('robot.db', 30.0)
    c = conn.cursor()
    for row in c.execute("SELECT UP.UID,Last_Notice_Time FROM UP,subGroup WHERE subGroup.UID=UP.UID AND subGroup.Sub_Type=2"):
        user[row[0]] = row[1]
    for row in c.execute("SELECT UP.UID,Last_Notice_Time FROM UP,subGroup WHERE subGroup.UID=UP.UID AND subGroup.Sub_Type=3"):
        user[row[0]] = row[1]
    for row in c.execute("SELECT UP.UID,Last_Notice_Time FROM UP,subPerson WHERE subPerson.UID=UP.UID AND subPerson.Sub_Type=2"):
        user[row[0]] = row[1]
    for row in c.execute("SELECT UP.UID,Last_Notice_Time FROM UP,subPerson WHERE subPerson.UID=UP.UID AND subPerson.Sub_Type=3"):
        user[row[0]] = row[1]
    conn.commit()
    conn.close()
    for uid,noticeTime in user.items():
        print(uid, noticeTime)

living_test()
#dynamic_test()