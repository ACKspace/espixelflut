class PatternGenerator
{
    // Pro tip: no more than 16 patterns
    patterns =
    [
        new HeissPattern(),
        //new MatrixPattern(),
        new RainbowPattern(),
        //new TwinklePattern()
    ];

    activePattern = 0;

    constructor( _displayNode, _controllerNode )
    {
        let n = 0;
        this.sliders = [
            new FancySlider( "pattern",     this.onCallback.bind( this, n++ ), _displayNode, _controllerNode ),
            new FancySlider( "Slider 2",       this.onCallback.bind( this, n++ ), _displayNode, _controllerNode ),
            new FancySlider( "Slider 3",    this.onCallback.bind( this, n++ ), _displayNode, _controllerNode ),
            new FancySlider( "Slider 4",        this.onCallback.bind( this, n++ ), _displayNode, _controllerNode ),
            new FancySlider( "Slider 5",  this.onCallback.bind( this, n++ ), _displayNode, _controllerNode ),
            new FancySlider( "Slider 6",         this.onCallback.bind( this, n++ ), _displayNode, _controllerNode )
        ];

        let pattern = this.patterns[ this.activePattern ];
        pattern.channels.forEach( (p,n) =>
        {
            let slider = this.sliders[n+1];
            slider.name = p;
            slider.value = pattern.channelValues[ n ];
        } );
        pattern.start();
    }

    onCallback( _index, _type, _value, _name )
    {
        if ( _index === 0 )
            return this.updatePattern( _value );

        return this.patterns[ this.activePattern ].updateChannel( _index - 1, _value );
    }

    updatePattern( _value )
    {
        let currentPattern = this.activePattern;
        this.activePattern = parseInt( _value / 256 * this.patterns.length );
        let pattern = this.patterns[ this.activePattern ];

        // Update pattern
        if ( currentPattern !== this.activePattern )
        {
            this.patterns[ currentPattern ].stop();
            pattern.start();

            // Apply channel values to sliders
            pattern.channels.forEach( (p,n) =>
            {
                let slider = this.sliders[n+1];
                slider.name = p;
                slider.value = pattern.channelValues[ n ];
            } );
        }
        return pattern.name;
    }

    tick()
    {
        // frame interval, report frame update
        return this.patterns[ this.activePattern ].tick();
    }

    getLedColor( _nLed )
    {
        return this.patterns[ this.activePattern ].getLedColor( _nLed );
    }
}
