var socket = chrome.sockets.udp;
var connected = false;
var socketId = null;
var timer = null;

const defaults = {
    hostname: "192.168.1.234",
    port: 1234,
    universe: 1,
    ledsPerUniverse: 170,
    ledCount: 200,
    artnet: true,
    autoupdate: false,
    colors: [ "#000000" ]
};
var settings = defaults;

window.addEventListener( "load", function()
{
    var address = document.getElementById( "address" );
    chrome.storage.local.get( [ 'hostname','port','universe','ledsPerUniverse','ledCount' ], function( _stored )
    {
        Object.assign( settings, defaults, _stored );
        address.value = settings.hostname;
        document.getElementById( "port" ).value = settings.port;
        document.getElementById( "universe" ).value = settings.universe;
        document.getElementById( "ledsPerUniverse" ).value = settings.ledsPerUniverse;
        document.getElementById( "ledCount" ).value = settings.ledCount;
        if ( settings.artnet )
            document.getElementById( "artnet" ).click();
        if ( settings.autoupdate )
            document.getElementById( "autoupdate" ).click();

        settings.colors.forEach( _color => addColor( _color ) );
    } );

    var local = "0.0.0.0";
    socket.create( {}, function( socketInfo )
    {
        // The socket is created, now we can send some data
        socketId = socketInfo.socketId;

        socket.bind( socketId, local, 0, function( connectResult )
        {
            connected = (connectResult == 0);
        } );
    });

    document.getElementById( "address" ).addEventListener( "input", function( _event )
    {
        settings.hostname = _event.target.value || defaults.hostname;
        updateSettings();
        update();
    } );

    document.getElementById( "universe" ).addEventListener( "input", function( _event )
    {
        settings.universe = parseInt( _event.target.value );
        updateSettings();
        update();
    } );

    document.getElementById( "ledsPerUniverse" ).addEventListener( "input", function( _event )
    {
        settings.ledsPerUniverse = parseInt( _event.target.value );
        updateSettings();
        update();
    } );

    document.getElementById( "ledCount" ).addEventListener( "input", function( _event )
    {
        settings.ledCount = parseInt( _event.target.value );
        updateSettings();
        update();
    } );

    document.getElementById( "add" ).addEventListener( "click", function( _event )
    {
        addColor();
        updateSettings();
    } );

    document.getElementById( "update" ).addEventListener( "click", function( _event )
    {
        update();
    } );

    document.getElementById( "autoupdate" ).addEventListener( "input", function( _event )
    {
        settings.autoupdate = _event.target.checked;
        updateSettings();
        if ( _event.target.checked )
            timer = setInterval( update, 250000 )
        else
            clearInterval( timer );
        update();
    } );

    document.getElementById( "artnet" ).addEventListener( "input", function( _event )
    {
        settings.artnet = _event.target.checked;

        document.getElementById( "port" ).disabled = settings.artnet;
        document.getElementById( "artnetSettings" ).style.display = settings.artnet ? "" : "none";
        updateSettings();
        update();
    } );

} );

function send( _data )
{
    if ( !connected )
        return;

    socket.send( socketId, new Uint8Array( _data ), settings.hostname, settings.artnet ? 6454 : settings.port, function( sendInfo )
    {
    });
}

function update( )
{
    var inputs = document.querySelectorAll( "#colors>div>input[type='color']" );
    if ( !inputs.length )
        return;
    var start = 0;
    var startColor = parseColor( inputs[ 0 ].value );

    var arrPacketEven = [];
    var arrPacketOdd = [];

    if ( settings.artnet )
    {
        // Add header
        arrPacketOdd = "Art-Net".split("").map( function(_c){ return _c.charCodeAt( 0 ) } );
        arrPacketEven = "Art-Net".split("").map( function(_c){ return _c.charCodeAt( 0 ) } );
        arrPacketOdd.push(  0, 
                            0x00, 0x50, /* ArtDMX opcode */
                            14, 0,      /* Protocol version */
                            0,          /* Sequence */
                            0,          /* Pyysical */
                            settings.universe,   /* Universe */
                            0, 0        /* Length */
                        );
        arrPacketEven.push( 0,
                            0x00, 0x50, /* ArtDMX opcode */
                            14, 0,      /* Protocol version */
                            0,          /* Sequence */
                            0,          /* Pyysical */
                            settings.universe + 1, /* Universe */
                            0, 0        /* Length */
                        );
    }

    for ( var i = 0; i < inputs.length; ++i )
    {
        var offset = 1;
        if ( inputs.length > 1 )
            offset = i / (inputs.length - 1);

        var end = Math.round( offset * settings.ledCount );
        var endColor = parseColor( inputs[ i ].value );

        for (var n = start; n < end; ++n )
        {
            if ( settings.artnet )
            {
                var color = colorBlend( startColor, endColor, (n - start) / (end - start) );
                if ( n > settings.ledsPerUniverse )
                    arrPacketEven.push( Math.round(color.B * 255), Math.round(color.R * 255), Math.round(color.G * 255) );
                else
                    arrPacketOdd.push( Math.round(color.B * 255), Math.round(color.R * 255), Math.round(color.G * 255) );
            }
            else
            {
                var packet = "PX " + ("00" + n).slice(-3) + " " + generateColorString( colorBlend( startColor, endColor, (n - start) / (end - start) ) );

                if ( n & 1 )
                    arrPacketOdd.push( packet );
                else
                    arrPacketEven.push( packet );
            }
        }

        start = end;
        startColor = endColor;
    }

    if ( settings.artnet )
    {
        var size;
        size = arrPacketOdd.length - 18;
        arrPacketOdd[ 16 ] = size >> 8;
        arrPacketOdd[ 17 ] = size & 0xff;

        size = arrPacketEven.length - 18;
        arrPacketEven[ 16 ] = size >> 8;
        arrPacketEven[ 17 ] = size & 0xff;

        send( arrPacketOdd );
        send( arrPacketEven );
    }
    else
    {
        send( arrPacketOdd.join("").split("").map( function(_c){ return _c.charCodeAt( 0 ) } ) );
        send( arrPacketEven.join("").split("").map( function(_c){ return _c.charCodeAt( 0 ) } ) );
    }
}

function updateSettings( )
{
    // Do the colors last-minute
    var colors = Array.prototype.map.call( document.getElementById( "colors" ).querySelectorAll( "div>input[type='color']" ), _color => _color.value );
    if ( colors.length )
        settings.colors = colors;

    chrome.storage.local.set( settings, function()
    {
        //console.log( "Settings updated" );
    } );
}

function parseColor( _colorString )
{
    // Create color 'vector' or ratio
    var result = _colorString.match( "#?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})" );

    var color = { R:0, G:0, B:0 };
    if ( result )
    {
        color.R = parseInt( result[1], 16 ) / 255;
        color.G = parseInt( result[2], 16 ) / 255;
        color.B = parseInt( result[3], 16 ) / 255;
    }

    return color;
}

function generateColorString( _color )
{
    var r = Math.round(_color.R * 255).toString(16);
    var g = Math.round(_color.G * 255).toString(16);
    var b = Math.round(_color.B * 255).toString(16);

    return ("0" + r).slice(-2) + ("0" + g).slice(-2) + ("0" + b).slice(-2);
}

function colorBlend( _color1, _color2, _ratio )
{
    var color = {};
    color.R = _color1.R * (1 - _ratio ) + _color2.R * _ratio;
    color.G = _color1.G * (1 - _ratio ) + _color2.G * _ratio;
    color.B = _color1.B * (1 - _ratio ) + _color2.B * _ratio;

    return color;
}

function removeColor( _event )
{
    var color = _event.target.parentElement;

    var index = [].indexOf.call( color.parentElement.querySelectorAll( "input[type='button']" ), _event.target ) + 1;
    color.parentElement.removeChild( color );

    // remove color stop
    var gradient = document.getElementById( "grad1" );
    gradient.removeChild( gradient.querySelectorAll( "stop" )[ index ] );
    updateSettings();

    spreadStops();
    document.getElementById( "gradient" ).innerHTML = document.getElementById( "gradient" ).innerHTML;
}

function addColor( _color )
{
    var colors = document.getElementById( "colors" );
    var length = colors.querySelectorAll( "div>input[type='color']" ).length;
    var div = colors.appendChild( document.createElement( "div" ) );

    if ( !length && !_color )
        _color = "#000000";

    var previousColor = _color ? _color : colors.querySelectorAll( "div>input[type='color']" )[ length - 1 ].value;
    if (length < settings.ledCount)
    {
        // add color input
        var color = div.appendChild( document.createElement( "input" ) );
        color.type = "color";
        color.id = "color" + ( length + 1 );
        color.value = previousColor;

        color.addEventListener( "input", function( _event )
        {
            document.getElementById( color.id + "_stop" ).style.stopColor = _event.target.value;
            updateSettings();
            if ( document.getElementById( "autoupdate" ).checked )
                update();
        } );

        // add color stop
        var gradient = document.getElementById( "grad1" );
        var stop = gradient.appendChild( document.createElement( "stop" ) );
        stop.id = "color" + ( length + 1 ) + "_stop"
        stop.style.stopColor = previousColor;

        // add 'remove' button
        if ( length )
        {
            var button = div.appendChild( document.createElement( "input" ) );
            button.type = "button";
            button.value = "-";
            button.onclick = removeColor;
        }

        spreadStops();
        document.getElementById( "gradient" ).innerHTML = document.getElementById( "gradient" ).innerHTML;
    }
}

function spreadStops( )
{
    var stops = gradient.querySelectorAll( "stop" );

    if ( document.getElementById( "autoupdate" ).checked )
        update();

    if ( stops.length === 1 )
        return;

    for ( var n = 0; n < stops.length; ++n )
    {
        stops[ n ].setAttribute( "offset", Math.round( n / ( stops.length - 1 ) * 100 ) + "%" );
    }
}
