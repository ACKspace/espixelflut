#!/usr/bin/python

# use `pip install` for  PIL and pyscreenshot
import os
from PIL import Image
import socket

if os.name == 'nt':
    import ImageGrab
else:
    import pyscreenshot as ImageGrab


ip = "192.168.1.234" # Change to correct IP address!
port = 1234
led_amount = 200
ttr = 0.1

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
        time.sleep(0.1)
        self.sock.sendto(bar.encode('latin-1'), (self.ip, self.port))
        
    
def getAverageScreenColor():
    shot = ImageGrab.grab()
    shot_resized = shot.resize((200,1), Image.ANTIALIAS)
    colors = []
    for i in range(200):
        color = shot_resized.getpixel((i,0))
        colors.append(format(color[0], 'x').zfill(2) + format(color[1], 'x').zfill(2) + format(color[2], 'x').zfill(2))
    return colors

ACKtree = ChristmasTree(ip, port, led_amount)

previousAverageScreenColor = ""

def rgbFormat(rgb):
    # Converts float tuple to hexstring
    return format(int(rgb[0]*255), 'x').zfill(2) + format(int(rgb[1]*255), 'x').zfill(2) + format(int(rgb[2]*255), 'x').zfill(2)

def rainbow(p):
    for i in range(led_amount):
        pixel = rgbFormat(colorsys.hsv_to_rgb(((i/led_amount)+(1/led_amount)*p*2)%1, 1, 1))
        ACKtree.sendSinglePixel(i, pixel)
        #time.sleep(0.1)

def falling():
    pixels = []
    for i in range(led_amount):
        pixels.append("ffffff")
    ACKtree.sendColorArray(pixels)
    while 1:
        if pixels[-1] == "ffffff":
            pixels[-1] = "000000"
            ACKtree.sendSinglePixel(50, "00000000")
        else:
            for i in range(0, led_amount):
                if pixels[-i] == "ffffff":
                    pixels[-i] = "000000"
                    ACKtree.sendSinglePixel(50-i, "000000")
                    pixels[-i + 1] = "ffffff"
                    ACKtree.sendSinglePixel(51-i, "ffffff")
                    break
        #ACKtree.sendColorArray(pixels) #ehh sending whole pixel arrays is a bit too much, lets do it per pixel!
        time.sleep(0.4)

#falling()

while 1:
    ACKtree.sendColorArray(getAverageScreenColor())


foo = 255
while 1:
    for i in range(foo):
        pixel = rgbFormat(colorsys.hsv_to_rgb((i/foo), 1, 1))
        ACKtree.sendFlood(pixel)
        time.sleep(1)

'''
while 1:
	for i in range(100):
		rainbow(i)
		time.sleep(2)


while 1:
    currentAverageScreenColor = getAverageScreenColor()
    if (currentAverageScreenColor != previousAverageScreenColor):
        ACKtree.sendFlood(currentAverageScreenColor)
        previousAverageScreenColor = currentAverageScreenColor
    time.sleep(ttr)'''
