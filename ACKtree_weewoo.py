#!/usr/bin/python

import ChristmasTree
import time

ip = "192.168.1.234" # Change to correct IP address!
port = 1234
ledAmount = 200

ACKtree = ChristmasTree.ChristmasTree(ip, port, ledAmount)

while 1:
    # Red on, blue off
    colors = []
    for i in range(0, ledAmount/2):
        colors.append('ff0000')
    for i in range(ledAmount/2, ledAmount):
        colors.append('000000')
    ACKtree.sendColorArray(colors)
    time.sleep(0.3)

    # Blue on, red off
    colors = []
    for i in range(0, ledAmount/2):
        colors.append('000000')
    for i in range(ledAmount/2, ledAmount):
        colors.append('0000ff')
    ACKtree.sendColorArray(colors)
    time.sleep(0.3)
