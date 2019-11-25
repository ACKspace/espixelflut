((w)=>{
const SPEED = 0;
const DISTANCE = 1;
const TAIL = 2;
const BRIGHTNESS = 3;
const HUE = 4;

class HeissPattern extends Pattern
{
    // price is right/preis ist heiß/prijzenslag running light
    constructor()
    {
        super( "heiß" );
        this.channels =
        [
            "speed",
            "distance",
            "tail",
            "brightness",
            "hue"
        ];

        // Set defaults
        this.channelValues[ SPEED ] = 250;
        this.channelValues[ DISTANCE ] = 3;
        this.channelValues[ TAIL ] = 1;
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
                    this.frame = this.channelValues[ DISTANCE ];
            }
            else
            {
                this.frame++;
                if ( this.frame > this.channelValues[ DISTANCE ] )
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
        this.color = this.hsl2rgb( this.channelValues[ HUE ], 255, this.channelValues[ BRIGHTNESS ] );
    }

    getLedColor( _nLed )
    {
        let ledFrame = ( _nLed + this.frame ) % ( this.channelValues[ DISTANCE ] + 1 );

        // TODO: optionally fade tail
        if ( ledFrame <= this.channelValues[ TAIL ] )
        {
            return this.color;
        }

        return [ 0, 0, 0 ];
    }

    start()
    {
        super.start();
    }
}

w.HeissPattern = HeissPattern;
})(window)

