class Pattern
{
    frameDelay = 0;
    frame = 0;
    channels = [];
    channelValues = [];
    dirty = true;

    constructor( _name )
    {
        this.name = _name;
    }

    updateChannel( _index, _value )
    {
        this.channelValues[ _index ] = +_value;
        // Display text
        return _value;
    }

    tick()
    {
        // frame interval, report frame update
        return false;
    }

    renderFrame()
    {
        // Function to update the pattern frame
    }

    getLedColor( _nLed )
    {
        throw new TypeError( "Pattern subclass must implement getLedColor" );
    }

    start()
    {
        // Apply channel values
        //this.channelValues[ _index ] = _value;
        //if ( this.channels.length !== this.channelValues.length )
            //this.channels.forEach( ( v, n ) => { this.channelValues[ n ] = 0 } );
        this.dirty = true;
    }

    stop()
    {
    }

    // Helpers
    // h:[0,360, s,v:[0,1]
    hsl2rgb_v( h, s, l )
    {
      let a=s*Math.min(l,1-l);
      let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);                 
      return [f(0),f(8),f(4)];
    }
    hsl2rgb( h, s, l )
    {
        //1,41176470588
        return this.hsl2rgb_v( h / 85 * 120, s / 255, l / 255 ).map( c => c * 255 | 0 );
    }

}
