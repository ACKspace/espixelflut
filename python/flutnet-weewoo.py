#!/usr/bin/env python
from lib.StupidArtnet import StupidArtnet

import time

ip = "192.168.6.85" # Change to correct IP address!
universe = 1
ledAmount = 50
packet_size = ledAmount*3

#ACKtree = ChristmasTree.ChristmasTree(ip, port, ledAmount)
a = StupidArtnet(ip, universe, packet_size)

packet = bytearray(packet_size)		# create packet for Artnet

while 1:
    # Red on, blue off
    for i in range(0, ledAmount/2):
        packet[3*i+0] = 255

    for i in range(ledAmount/2, ledAmount):
        packet[3*i+2] = 0
    a.set(packet)
    a.show()
    time.sleep(0.3)

    # Blue on, red off
    for i in range(0, ledAmount/2):
        packet[3*i+0] = 0

    for i in range(ledAmount/2, ledAmount):
        packet[3*i+2] = 255
    a.set(packet)
    a.show()
    time.sleep(0.3)



