#!/usr/bin/python

# use `pip install` for  PIL and pyscreenshot
import os
from PIL import Image
import socket
import random # test speed
from time import sleep

ip = "192.168.1.234" # Change to correct IP address!
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
        self.sock.sendto(("PX " + str(LEDx) + " " + str(color) ).encode('latin-1'), (self.ip, self.port))

    def sendFlood(self, color):
        for i in range(self.numberOfLEDs):
            self.sendSinglePixel(i, color)

    def sendRandomFlood(self, color, length ):
        for i in range(self.numberOfLEDs + length):
            self.sendSinglePixel(i, color )
            sleep( 0.1 )
            self.sendSinglePixel( (i - length ) % 200, '000000')
            sleep( 0.1 )

def getRandomColor():
    return '%06x' % random.randrange(16**6)

ACKtree = ChristmasTree(ip, port, led_amount)

while 1:
    color = getRandomColor()
    #length = random.randint(1, 100)
    length = pow( 2, random.randint(1, 6) )
    ACKtree.sendRandomFlood( color, length )

