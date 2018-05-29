//
//  ChristmasTree.swift
//  ESPixelflut
//

import Foundation


class ChristmasTree {
    var ip: String
    var port: Int
    var ledAmount: Int
    
    init(_ ip: String, _ port: Int, _ ledAmount: Int = 0) {
        self.ip = ip
        self.port = port
        self.ledAmount = ledAmount
    }
    
    func increaseTextLength(_ string: String, _ length: Int, _ prefix: String) -> String {
        var increased = string
        while increased.count < length {
            increased = prefix + increased
        }
        return increased
    }
    
    func sendColorArray(_ colors: [String]) {
        var colorArray = colors
        var colorString = [String]()
        var colorStringPos: Int {
            return max(colorString.count - 1, 0)
        }
        
        while colorArray.count > ledAmount {
            print("warning: color array is too large, reducing size!")
            colorArray.popLast()
        }
        if colorArray.count != ledAmount {
            print("warning: color array has a different size than ledAmount!")
        }
        
        for (led, color) in colorArray.enumerated() {
            if led == ledAmount / 2 {
                colorString[colorStringPos + 1] = ""
            }
            colorString[colorStringPos] += "PX \(self.increaseTextLength(String(led), 3, "0")) \(color)"
        }
        
        for string in colorString {
            self.udpSend(string)
        }
    }
    
    func sendSinglePixel(_ led: Int, color: String) {
        self.udpSend("PX \(self.increaseTextLength(String(led), 3, "0")) \(color)")
    }
    
    func sendFlood(_ color: String) {
        var colorArray = [String]()
        for _ in 0 ..< self.ledAmount {
            colorArray.append(color)
        }
        self.sendColorArray(colorArray)
    }
    
    func udpSend(_ udpString: String) {
        // TODO make sure UDP works
    }
}
