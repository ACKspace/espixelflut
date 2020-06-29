#!/usr/bin/env python3
from lib.StupidArtnet import StupidArtnet
import pyaudio
import time
import struct
import math

ip = "192.168.6.85" # Change to correct IP address!
universe = 1
ledAmount = 100
packet_size = ledAmount*3

p = pyaudio.PyAudio()

CHANNELS = 2
RATE = 44100  
SHORT_NORMALIZE = (1.0/32768.0)
INPUT_BLOCK_TIME = 0.05
INPUT_FRAMES_PER_BLOCK = int(RATE*INPUT_BLOCK_TIME)

THRESHOLD = 0.2
def main():
    a = StupidArtnet(ip, universe, packet_size)

    packet = bytearray(packet_size)		    # create packet for Artnet
    vu = bytearray(int(packet_size/CHANNELS))    # create initial part of a VU
    # red
    for i in range(45, 50): # TODO: CHANNELS
        vu[3*i+0] = 255
    # yellow
    for i in range(30, 45): # TODO: CHANNELS
        vu[3*i+0] = 255
        vu[3*i+1] = 128
    # green
    for i in range(0, 30): # TODO: CHANNELS
        vu[3*i+1] = 255

    stream = False
    audio = pyaudio.PyAudio()
    #device_index = find_input_device(audio)
    try:
        stream = audio.open(format=pyaudio.paInt16,
                            channels=CHANNELS,
                            rate=RATE,
                            input=True,
                            output=True,
                            #input_device_index = 0,#device_index,
                            frames_per_buffer=INPUT_FRAMES_PER_BLOCK
                           )

        while True:
            block = stream.read(INPUT_FRAMES_PER_BLOCK)
            left,right = get_rms( block, CHANNELS )
            left /= THRESHOLD
            right /= THRESHOLD
            if ( left > 1 ):
                left = 1
            if ( right > 1 ):
                right = 1

            asciil = ( " " * int( 10 - left * 10 ) ) + ( "#" * int( left * 10 ) )
            asciir = ( "#" * int( right * 10 ) + ( " " * int( 10 - right * 10 ) ) )
            print( "[{0}][{1}]\r".format( asciil, asciir ), end="" )
                
            left = int( left * ledAmount / CHANNELS )
            right = int( right * ledAmount / CHANNELS )
            
            for i in range(0, int(ledAmount/CHANNELS)):
                packet[147-3*i] = vu[3*i+0] if i <= left else 0
                packet[148-3*i] = vu[3*i+1] if i <= left else 0
                packet[149-3*i] = vu[3*i+2] if i <= left else 0
                
            for i in range(0, int(ledAmount/CHANNELS)):
                packet[3*i+150] = vu[3*i+0] if i <= right else 0
                packet[3*i+151] = vu[3*i+1] if i <= right else 0
                packet[3*i+152] = vu[3*i+2] if i <= right else 0

            a.set(packet)
            a.show()
    finally:
        if ( stream ):
            stream.stop_stream()
            stream.close()
        audio.terminate()

def get_rms( block, channels ):
    # RMS amplitude is defined as the square root of the 
    # mean over time of the square of the amplitude.
    # so we need to convert this string of bytes into 
    # a string of 16-bit samples...

    # we will get one short out for each 
    # two chars in the string.
    count = len(block)/channels
    format = "%dh"%(count)
    shorts = struct.unpack( format, block )

    # iterate over the block.
    # TODO: channels
    sum_squares_l = 0.0
    sum_squares_r = 0.0
    for index, sample in enumerate(shorts):
        # sample is a signed short in +/- 32768. 
        # normalize it to 1.0
        n = sample * SHORT_NORMALIZE
        # TODO: channels
        if index % 2 == 1:
            sum_squares_r += n*n
        else:
            sum_squares_l += n*n

    # TODO: channels
    return math.sqrt( sum_squares_l / count / channels ), math.sqrt( sum_squares_r / count / channels )

def find_input_device(audio):
    device_index = None            
    for i in range( audio.get_device_count() ):     
        devinfo = audio.get_device_info_by_index(i)   
        print( "Device %d: %s"%(i,devinfo["name"]) )

        for keyword in ["mic","input"]:
            if keyword in devinfo["name"].lower():
                print( "Found an input: device %d - %s"%(i,devinfo["name"]) )
                device_index = i
                return device_index
                
if __name__ == "__main__":
    main()

