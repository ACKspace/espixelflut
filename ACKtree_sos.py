#!/usr/bin/python

import ChristmasTree
import time

ip = "192.168.1.234" # Change to correct IP address!
port = 1234
ledAmount = 200
dotTime = 0.2
dotColor = 'ffffff'

ACKtree = ChristmasTree.ChristmasTree(ip, port, ledAmount)

morseSpaces = []
morseDots = []

def morseWordSpace():
    ACKtree.sendColorArray(morseSpaces)
    time.sleep(dotTime*6)

def morseElementSpace():
    ACKtree.sendColorArray(morseSpaces)
    time.sleep(dotTime)

def morseCharacterSpace():
    ACKtree.sendColorArray(morseSpaces)
    time.sleep(dotTime*2)

def morseDot():
    ACKtree.sendColorArray(morseDots)
    time.sleep(dotTime)
    morseElementSpace()

def morseDash():
    ACKtree.sendColorArray(morseDots)
    time.sleep(dotTime*3)
    morseElementSpace()

for i in range(ledAmount):
    morseSpaces.append('000000')
for i in range(ledAmount):
    morseDots.append(dotColor)
morseWordSpace

while 1:
    morseDot()
    morseDot()
    morseDot()
    morseCharacterSpace()
    morseDash()
    morseDash()
    morseDash()
    morseCharacterSpace()
    morseDot()
    morseDot()
    morseDot()
    morseWordSpace()
