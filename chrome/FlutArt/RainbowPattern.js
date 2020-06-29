const SPEED = 0;
const DENSITY = 1;
const SATURATION = 2;
const BRIGHTNESS = 3;
const HUE = 4;

class RainbowPattern extends Pattern
{
    // rainbow colorwheel (needs fixing)
    constructor()
    {
        super( "rainbow" );
        this.channels =
        [
            "speed",        // transition speed (how fast the color wheel is turning)
            "density",      // transition density (how short the 'rainbow' is)
            "saturation",   // from monochrome to full color
            "brightness",   // LED brightness from 'off' to white
            "hue"           // start hue
        ];

        // Set defaults
        this.channelValues[ SPEED ] = 250;
        this.channelValues[ DENSITY ] = 3;
        this.channelValues[ SATURATION ] = 255;
        this.channelValues[ BRIGHTNESS ] = 145;
        this.channelValues[ HUE ] = 20;

        this.color = this.hsl2rgb( this.channelValues[ HUE ], 255, this.channelValues[ BRIGHTNESS ] );
    }

    updateChannel( _index, _value )
    {
        // TODO: this.dirty = true on color channel change
        return super.updateChannel( _index, _value );
    }

    tick()
    {
        let delay = this.channelValues[ SPEED ];
        if ( delay === 127 || delay === 128 )
        {
            if ( this.dirty )
            {
                this.dirty = false;
                return true;
            }
            return false;
        }

        let forward = delay < 127 ? false : true;
        delay = forward ? (255 - delay ) * 2 : delay * 2;

        if ( this.frameDelay++ >= delay )
        {
            // Update frame
            if ( forward )
            {
                this.frame--
                if ( this.frame < 0 )
                    this.frame = 360;
            }
            else
            {
                this.frame++;
                if ( this.frame > 360 )
                    this.frame = 0;
            }
            this.renderFrame();

            this.frameDelay = 0;
            return true;
        }

        if ( this.dirty )
        {
            this.dirty = false;
            return true;
        }

        return false;
    }

    renderFrame()
    {
        // Function to update the pattern frame
    }

    getLedColor( _nLed )
    {
        let hue = ( this.channelValues[ HUE ] + (1 * this.frame ) + ( _nLed * this.channelValues[ DENSITY ] ) ) % 360
        return this.hsl2rgb( hue, 255, this.channelValues[ BRIGHTNESS ] );
    }

    start()
    {
        super.start();
    }
}
