#!/usr/bin/python

import random
import ChristmasTree

ip = "192.168.1.234" # Change to correct IP address!
port = 1234
led_amount = 200

def getRandomColor():
    return '%06x' % random.randrange(16**6)

ACKtree = ChristmasTree.ChristmasTree(ip, port, led_amount)

while 1:
    color = getRandomColor()
    #length = random.randint(1, 100)
    length = pow( 2, random.randint(1, 6) )
    ACKtree.sendRandomFlood( color, length )
