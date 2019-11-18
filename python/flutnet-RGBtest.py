#!/usr/bin/env python3
# Mostly stolen from https://www.youtube.com/watch?v=ZA_PxLuofV4 / https://learndataanalysis.org/control-lcd-number-widget-with-a-slider-pyqt5-tutorial/
from lib.StupidArtnet import StupidArtnet
import sys
from PyQt5.QtWidgets import (QApplication, QWidget, QLCDNumber, QSlider, QVBoxLayout)
from PyQt5.QtCore import Qt

ip = "192.168.6.85" # Change to correct IP address!
universe = 1
ledAmount = 100
packet_size = ledAmount*3

a = StupidArtnet(ip, universe, packet_size, fps=20)
packet = bytearray(packet_size) # create packet for Artnet

r = 0
g = 0
b = 0
c = 0

class AppDemo(QWidget):
    def __init__(self):
        super().__init__()
        self.resize(600, 500)
        self.setWindowTitle('flutnet - ArtNet pixelflut')

        self.lcd = QLCDNumber()
        sliderLed = QSlider(Qt.Horizontal)
        sliderLed.setMaximum(ledAmount)
        sliderLed.setMinimum(0)
        sliderLed.valueChanged.connect(self.updateCount)

        sliderR = QSlider(Qt.Horizontal)
        sliderR.setMaximum(255)
        sliderR.setMinimum(0)
        sliderR.valueChanged.connect(self.updateR)

        sliderG = QSlider(Qt.Horizontal)
        sliderG.setMaximum(255)
        sliderG.setMinimum(0)
        sliderG.valueChanged.connect(self.updateG)

        sliderB = QSlider(Qt.Horizontal)
        sliderB.setMaximum(255)
        sliderB.setMinimum(0)
        sliderB.valueChanged.connect(self.updateB)

        layout = QVBoxLayout()
        layout.addWidget(self.lcd)
        layout.addWidget(sliderLed)
        layout.addWidget(sliderR)
        layout.addWidget(sliderG)
        layout.addWidget(sliderB)
        self.setLayout(layout)

    def update(self):
        print( "count:" + str(c) + " R:" + str(r) + " G:" + str(g) + " B:" + str(b) )

        for i in range(0, c):
            packet[3*i+0] = r
            packet[3*i+1] = g
            packet[3*i+2] = b
        for i in range(c, ledAmount):
            packet[3*i+0] = 0
            packet[3*i+1] = 0
            packet[3*i+2] = 0

        a.set(packet)
        #a.show()
        
    def updateCount(self, event):
        global c
        c = event
        self.lcd.display(event)
        self.update()
        
    def updateR(self, event):
        global r
        r = event
        self.update()
    def updateG(self, event):
        global g
        g = event
        self.update()
    def updateB(self, event):
        global b
        b = event
        self.update()

if __name__ == '__main__':
    app = QApplication(sys.argv)

    a.start()
    demo = AppDemo()
    demo.show()

    sys.exit(app.exec_())

