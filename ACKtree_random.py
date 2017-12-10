#!/usr/bin/python

# use `pip install` for  PIL and pyscreenshot
import os
from PIL import Image
import socket
import random # test speed
from time import sleep

ip = "192.168.1.120" # Change to correct IP address!
port = 1234
led_amount = 200
#numberOfLEDs=0
class ChristmasTree( ):
    def __init__(self, ip, port, numberOfLEDs=0):
        self.ip = ip
        self.port = port
        self.numberOfLEDs = numberOfLEDs
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    def sendColorArray(self, colorArray):
        if len(colorArray) != numberOfLEDs:
            print("warning: color array has a different size then numberOfLEDs!")
        for LEDx, color in enumerate(colorArray):
            self.sendSinglePixel(LEDx, color)
    
    def sendSinglePixel(self, LEDx, color):
        self.sock.sendto(("PX " + str(LEDx) + " " + str(color) + '\n').encode('latin-1'), (self.ip, self.port))

    def sendFlood(self, color):
        for i in range(self.numberOfLEDs):
            self.sendSinglePixel(i, color)

def getRandomColor():
    sleep( 0.05 )
    return '%06x' % random.randrange(16**6)

ACKtree = ChristmasTree(ip, port, led_amount)

while 1:
    ACKtree.sendFlood(getRandomColor())

