#!/usr/bin/python

import socket
from time import sleep

class ChristmasTree():
    def __init__(self, ip, port, numberOfLEDs=0):
        self.ip = ip
        self.port = port
        self.numberOfLEDs = numberOfLEDs
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def sendColorArray(self, colorArray):
        foo = ""
        if len(colorArray) != self.numberOfLEDs:
            print("warning: color array has a different size then numberOfLEDs!")
        for LEDx, color in enumerate(colorArray):
            foo += "PX " + str(LEDx).zfill(3) + " " + color
        self.sock.sendto(foo[:int(len(foo)/2)].encode('latin-1'), (self.ip, self.port))
        self.sock.sendto(foo[int(len(foo)/2):].encode('latin-1'), (self.ip, self.port))

    def sendSinglePixel(self, LEDx, color):
        self.sock.sendto(("PX " + str(LEDx) + " " + str(color)).encode('latin-1'), (self.ip, self.port))

    def sendFlood(self, color):
        foo = ""
        bar = ""
        for i in range(100):
            foo += ("PX " + str(i*2).zfill(3) + " " + str(color))
            bar += ("PX " + str(i*2 + 1).zfill(3) + " " + str(color))
        self.sock.sendto(foo.encode('latin-1'), (self.ip, self.port))
        sleep(0.1)
        self.sock.sendto(bar.encode('latin-1'), (self.ip, self.port))

    def sendRandomFlood(self, color, length ):
        for i in range(self.numberOfLEDs + length):
            self.sendSinglePixel(i, color )
            sleep( 0.1 )
            self.sendSinglePixel( (i - length ) % 200, '000000')
            sleep( 0.1 )
