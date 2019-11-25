class FancySlider
{
    constructor( _name, _callback, _displayNode, _controllerNode )
    {
        this._name = _name;
        if ( typeof _callback === "function" )
            this.callback = _callback;
        else
            this.callback = ( _type, _value, _name ) => { return _value };

        this.displayNode = document.createElement( "span" );
        this.displayNode.className = "fancyDisplay";
        this.displayNode.textContent = _name;

        this.controllerNode = document.createElement( "input" );
        this.controllerNode.type = "range";
        this.controllerNode.className = "fancy vertical";
        this.controllerNode.min = 0;
        this.controllerNode.value = 0;
        this.controllerNode.max = 255;

        this.controllerNode.addEventListener( "input", this.onInput.bind( this ) );
        this.controllerNode.addEventListener( "pointerdown", this.onActivate.bind( this ) );
        this.controllerNode.addEventListener( "pointerup", this.onDeactivate.bind( this ) );

        _displayNode.appendChild( this.displayNode );
        _controllerNode.appendChild( this.controllerNode );
    }

    get name()
    {
        return this._name;
    }

    set name( _name )
    {
        this._name = _name;
        if ( !this.active )
            this.displayNode.textContent = _name;
    }

    get value()
    {
        return this.controllerNode.value;
    }

    set value( _value )
    {
        this.controllerNode.value = _value;
    }

    onActivate( _event )
    {
        this.active = true;
        this.displayNode.textContent = this.callback( "activate", this.controllerNode.value, this._name );
    }

    onDeactivate( _event )
    {
        this.active = false;
        this.callback( "deactivate", this.controllerNode.value, this._name );
        setTimeout( () => { if ( !this.active ) this.displayNode.textContent = this._name }, 1500 );
    }

    onInput()
    {
        this.displayNode.textContent = this.callback( "change", this.controllerNode.value, this._name );
    }
}

