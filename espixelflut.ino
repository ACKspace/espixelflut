#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <EEPROM.h>
//#include <NeoPixelBus.h>
#include <NeoPixelBrightnessBus.h>

#define DEBUG
//#define DEBUG_VERBOSE
#define LED_DEBUG_IP

#define UDP_PORT 1234
#define PIN_ROTARY1 5
#define PIN_ROTARY2 4
#define PIN_PUSHBUTTON 0
#define PIN_LEDS 0
#define ESSID "ACKspaceWifi"
#define WPA_PASS "nope"
#define TIMEOUT 10 * 60 * 1000 // 10 minutes

// Debug logging
#ifdef DEBUG_VERBOSE
#define log( _str ) Serial.print( _str )
#else
#define log( _str ) void( _str )
#endif

// Create udp interface
WiFiUDP Udp;
char g_incomingPacket[ 14 ];
// 12V string uses RGB
NeoPixelBrightnessBus<NeoRgbFeature, NeoEsp8266Dma800KbpsMethod> strip( 250 );      // use rx0/gpio3
//5V separate neopixels: NeoPixelBrightnessBus<NeoGrbFeature, NeoEsp8266Dma800KbpsMethod> strip( 250 );      // use rx0/gpio3
//NeoPixelBus<NeoGrbFeature, NeoEsp8266Uart800KbpsMethod> strip( 250 );     // tx1/gpio2
//NeoPixelBus<NeoGrbFeature, NeoEsp8266AsyncUart800KbpsMethod> strip( 250 );// tx1/gpio2
NeoGamma<NeoGammaTableMethod> colorGamma;

volatile bool g_bFalling_Edge = false;
uint8_t g_leds = 0;
unsigned long g_time = 0;
bool g_bBlink = false;

///////////////////////////////////////////////////////////////////////////////
// setup
///////////////////////////////////////////////////////////////////////////////
void setup()
{
  Serial.begin( 115200 );
  log( F( "initializing..\n" ) );

  // Prepare pins
  pinMode( PIN_PUSHBUTTON, INPUT_PULLUP );
  pinMode( PIN_ROTARY1, INPUT_PULLUP );
  pinMode( PIN_ROTARY2, INPUT_PULLUP );

  initializeEEPROM();
  initializeLeds();
  initializeNetwork();

  // Delay so the user can press the rotary encoder
  delay( 2000 );
  
  int nPos;
  if ( !digitalRead( PIN_PUSHBUTTON ) )
  {
    log( F( "config mode" ) );

    // Config
    while ( !digitalRead( PIN_PUSHBUTTON ) )
    {
      ESP.wdtFeed();
      delay( 10 );
    }
    g_leds = 0;

    // enable interrupt for rotary encoder 
    attachInterrupt( digitalPinToInterrupt( PIN_ROTARY1 ), button_ISR, FALLING );
    while ( digitalRead( PIN_PUSHBUTTON ) )
    {
      if ( g_bFalling_Edge )
      {
        //sei
        //noInterrupts();
        //delayMicros( 10000 );
        if ( digitalRead( PIN_ROTARY2 ) )
        {
          ++g_leds;
          if ( g_leds > 249 )
            g_leds = 0;
          log( String( g_leds, DEC ) + "\n" );
          blinkled( g_leds );
        }
        else
        {
          --g_leds;
          // Note that unsigned wraps around
          if ( g_leds > 249 )
            g_leds = 249;
          log( String( g_leds, DEC ) + "\n" );
          blinkled( g_leds );
        }
        delay( 20 );
        //cli
        //interrupts();
        g_bFalling_Edge = false;
      }

      if ( g_time + 250 < millis() )
      {
        g_bBlink = !g_bBlink;
        g_time = millis();
        blinkled( g_leds );
      }
      ESP.wdtFeed();
    }
    detachInterrupt( digitalPinToInterrupt( PIN_ROTARY1 ) );

    // Get last written value (wear leveling)
    nPos = getFirstAvailableEepromAddress();

    if ( !nPos || EEPROM.read( nPos - 1 ) != g_leds )
    {
      log( F( "writing " ) );
      log( String( g_leds, DEC ) );
      log( F( " @ " ) );
      log( String( nPos, DEC ) );
      EEPROM.write( nPos, g_leds );
#ifdef ESP8266
      // Commit after write
      EEPROM.commit();
#endif
    }
    log( F( "done\n" ) );
  }
  else
  {
    // Get last written value (wear leveling)
    nPos = getFirstAvailableEepromAddress();
    if ( nPos >= 0 )
      g_leds = EEPROM.read( nPos - 1 );
    else
      g_leds = 0;
    log( F( "led count: " ) );
    log( String( g_leds, DEC ) );
    log( F( "\n" ) );
  }
}


///////////////////////////////////////////////////////////////////////////////
// loop
///////////////////////////////////////////////////////////////////////////////
void loop()
{
  // TODO: Upon button press, show the IP address using the LEDs
  
  if ( millis() - g_time > TIMEOUT )
  {
    log( F( "Packet timeout: resetting colors\n" ) );
    strip.ClearTo( RgbColor( 0, 0, 0 ) );
    strip.Show();
    g_time = millis();
  }

  int packetSize = Udp.parsePacket();
  if (packetSize)
  {
#ifdef DEBUG_VERBOSE
    Serial.printf("Received %d bytes from %s, port %d\n", packetSize, Udp.remoteIP().toString().c_str(), Udp.remotePort());
#endif

    // Read packet (and leave space for a null character)
    // ugly hack #sorryjoshua
    if ( packetSize < 13 )
      packetSize = 13;
    for ( byte packets = 0; packets < packetSize / 13; ++packets )
    {
      int len = Udp.read( g_incomingPacket, 13 );
      if ( len > 0 )
      {
        // Stringify (null-terminate)
        g_incomingPacket[len] = 0;
  
  #ifdef DEBUG_VERBOSE
        Serial.printf("UDP packet contents: %s\n", g_incomingPacket);
  #endif
  
        byte num;
        uint32_t color;
        RgbColor rgbColor;
        color = parseCommand( g_incomingPacket, len, num );
        if ( color != -1 )
        {
  #ifdef DEBUG_VERBOSE
            Serial.print( "\nLed:" );
            Serial.println( num, DEC );
            Serial.print( "Color:" );
            Serial.println( color, HEX );
  #endif
          rgbColor = colorGamma.Correct( RgbColor((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff ) );
          strip.SetPixelColor( num, rgbColor );
          g_time = millis(); 
        }
        else
        {
          log( "failed to parse packet" );
        }
      }
    } // for
    strip.Show();  }  
}

///////////////////////////////////////////////////////////////////////////////
// button_ISR
///////////////////////////////////////////////////////////////////////////////
void button_ISR()
{
  g_bFalling_Edge = true;
}

bool initializeNetwork()
{
  WiFi.begin( ESSID, WPA_PASS );

  log( F( "Wifi." ) );
  while ( WiFi.status() != WL_CONNECTED )
  {
    delay(500);
    log( F( "." ) );
    ESP.wdtFeed();
  }

  log( F( "Connected. IP: " ) );
#ifdef DEBUG
  Serial.println( WiFi.localIP() );
#endif

  // Start the UDP server
  Udp.begin( UDP_PORT );

  return true;
}

bool initializeLeds()
{
  log( F( "LEDs: " ) );
  strip.Begin();
  strip.Show(); // Initialize all pixels to 'off'
  // Set brighness to 2/3 to make sure our cables and fuse hold
  strip.SetBrightness( 177 );
  log( F( "done\n" ) );
  return true;
}

bool initializeEEPROM()
{
  log( F( "EEPROM:\n" ) );
#ifdef ESP8266
#define E2END 511
  // Assign flash memory for EEPROM emulation
  EEPROM.begin( E2END + 1 );
#endif
  
#ifdef DEBUG_VERBOSE
  // Show EEPROM memory, note that we can't use EEPROM.length() yet
  for (int i=0; i <= E2END; ++i )
  {
    if ( EEPROM.read( i ) < 16 )
      log( F( "0" ) );
    log( String( EEPROM.read( i ), HEX ) );
    if ( ( i % 16 ) == 15 )
      log( F( "\n" ) );
  }
#endif
  log( F( "done\n" ) );

  return true;
}

///////////////////////////////////////////////////////////////////////////////
// parseCommand
///////////////////////////////////////////////////////////////////////////////
uint32_t parseCommand( char* _command, byte _length, byte& _led )
{
  // PX <index> <RRGGBB>
  //echo -n "PX 123 FFFFFF" | nc -uw0 192.168.2.86 1234

  // Verify proper length
  if ( _length < 11 || _length > 13 )
  {
    log( F( "Command: wrong length\n" ) );
    return -1;
  }

  // Verify that the command starts with "PX "
  if ( _command[0] != 'P' || _command[1] != 'X' || _command[2] !=' ' )
  {
    log( F( "Command: invalid 'header'\n" ) );
    return -1;
  }

  // Parse the number
  char* pCommand;
  _led = strtoul( _command + 3, &pCommand, 10 );

  // Verify that it is followed by a space
  if ( *pCommand != ' ' )
  {
    log( F( "Command: expected space after led index\n" ) );
    return -1;
  }

  // Convert the next HEX characters into a number and return it
  return strtoul( pCommand + 1, NULL, 16 );
}

///////////////////////////////////////////////////////////////////////////////
// getFirstAvailableEepromAddress
///////////////////////////////////////////////////////////////////////////////
int getFirstAvailableEepromAddress()
{
  int nPos = 0;
  while ( EEPROM.read( nPos ) != 255 && nPos <= E2END )
    ++nPos;

  // TODO: verify off by one error
  if ( nPos > E2END )
    return -1;

  return nPos;
}

///////////////////////////////////////////////////////////////////////////////
// blinkLed
///////////////////////////////////////////////////////////////////////////////
void blinkled( byte _nLed )
{
  strip.ClearTo( RgbColor( 0, 0, 0 ) );
  if ( g_bBlink )
    strip.SetPixelColor( _nLed, RgbColor( 255, 255, 0 ) );
  
  strip.Show();  
}

