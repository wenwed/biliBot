from json import loads,dumps
from bs4 import BeautifulSoup
import requests

def search(uid):
    url="http://101.201.64.44/breeze/user.t?uid=" + uid
    res = requests.get(url)
    soup = BeautifulSoup(res.text, 'html.parser')
    tbody = soup.tbody
    result = tbody.find_all('tr')
    i = 0
    res = ''
    for tr in result:
        if(i==0):
            i = i + 1
            continue
        else:
            i = i + 1
            r = tr.find_all()
            res = res + "勋章：" + r[0].string
            res = res + " 等级：" + r[3].string
            res = res + " 成长总值：" + r[4].string
            res = res + " 当前等级亲密：" + r[5].string
            res = res + "\n"
    res = "总共" + str(i-1) + "个勋章：\n" + res
    return res
