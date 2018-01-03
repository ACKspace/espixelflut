#!/usr/bin/python
# coding=utf-8

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
morseChars = {
    'A':'.-', 'B':'-...', 'C':'-.-.',
    'D':'-..', 'E':'.', 'F':'..-.',
    'G':'--.', 'H':'....', 'I':'..',
    'J':'.---', 'K':'-.-', 'L':'.-..',
    'M':'--', 'N':'-.', 'O':'---',
    'P':'.--.', 'Q':'--.-', 'R':'.-.',
    'S':'...', 'T':'-', 'U':'..-',
    'V':'...-', 'W':'.--', 'X':'-..-',
    'Y':'-.--', 'Z':'--..', '1':'.----',
    '2':'..---', '3':'...--', '4':'....-',
    '5':'.....', '6':'-....', '7':'--...',
    '8':'---..', '9':'----.', '0':'-----',
    # TODO better implement prosigns
    'Ä':'.-.-', 'Á':'.-.-', '+':'.-.-.',
    '&':'.-...', '=':'-...-', '?':'..--..',
    '(':'-.--.', 'Š':'...-.', 'Ś':'...-.'
}

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

def morseSend(morseText):
    morseText = morseText.upper()
    for char in morseText:
        if char == ' ':
            morseWordSpace()
        elif char in morseChars:
            morseChar = morseChars[char]
            for x in morseChar:
                if x == '.':
                    morseDot()
                elif x == '-':
                    morseDash()
            morseCharacterSpace()

toSend = raw_input('Send what text? ')

for i in range(ledAmount):
    morseSpaces.append('000000')
for i in range(ledAmount):
    morseDots.append(dotColor)
morseWordSpace()

while 1:
    morseSend(toSend)
    morseWordSpace()
