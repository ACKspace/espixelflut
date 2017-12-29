#!/usr/bin/python

import ChristmasTree
import random

ip = "192.168.1.234" # Change to correct IP address!
port = 1234
led_amount = 200
#numberOfLEDs=0

def getRandomColor():
    return '%06x' % random.randrange(16**6)

ACKtree = ChristmasTree.ChristmasTree(ip, port, led_amount)

while 1:
    ACKtree.sendFlood(getRandomColor())
