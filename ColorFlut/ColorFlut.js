var demo = null;

var socket = chrome.sockets.udp;
var connected = false;
var socketId = null;
var hostname = "";
var port = 0;

var ledCount = 200;

window.addEventListener( "load", function()
{
    var address = document.getElementById( "address" );

    var hostnamePort = address.value.split(":");
    hostname = hostnamePort[0];
    port = (hostnamePort[1] || 1234 ) | 0;

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

    document.getElementById( "add" ).addEventListener( "click", function( _event )
    {
        addColor();
    } );

    document.getElementById( "update" ).addEventListener( "click", function( _event )
    {
        update();
    } );

    document.getElementById( "color1" ).addEventListener( "input", function( _event )
    {
        document.getElementById( "color1_stop" ).style.stopColor = _event.target.value;
        if ( document.getElementById( "autoupdate" ).checked )
            update();
    } );

} );

function send( _data )
{
    if ( !connected )
        return;

    var arrayBuffer = new Uint8Array( _data.split("").map( function(_c){ return _c.charCodeAt( 0 ) } ) );

    socket.send( socketId, arrayBuffer, hostname, port, function( sendInfo )
    {
    });
}

function update( )
{
    var inputs = document.querySelectorAll( "#colors>div>input[type='color']" );
    var start = 0;
    var startColor = parseColor( inputs[ 0 ].value );

    var arrPacketEven = [];
    var arrPacketOdd = [];

    for ( var i = 0; i < inputs.length; ++i )
    {
        var offset = 1;
        if ( inputs.length > 1 )
            offset = i / (inputs.length - 1);

        var end = Math.round( offset * ledCount );
        var endColor = parseColor( inputs[ i ].value );

        for (var n = start; n < end; ++n )
        {
            var packet = "PX " + ("00" + n).slice(-3) + " " + generateColorString( colorBlend( startColor, endColor, (n - start) / (end - start) ) );

            if ( n & 1 )
                arrPacketOdd.push( packet );
            else
                arrPacketEven.push( packet );
        }

        start = end;
        startColor = endColor;
    }

    send( arrPacketOdd.join("") );
    send( arrPacketEven.join("") );
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
    //console.log( this, _event.target );
    var color = _event.target.parentElement;

    console.log( color.parentElement.querySelectorAll( "input[type='button']" ), color );

    var index = [].indexOf.call( color.parentElement.querySelectorAll( "input[type='button']" ), _event.target ) + 1;
    color.parentElement.removeChild( color );

    // remove color stop
    var gradient = document.getElementById( "grad1" );
    gradient.removeChild( gradient.querySelectorAll( "stop" )[ index ] );

    spreadStops();
    document.getElementById( "gradient" ).innerHTML = document.getElementById( "gradient" ).innerHTML;
}

function addColor( _index )
{
    var colors = document.getElementById( "colors" );
    var length = colors.querySelectorAll( "div>input[type='color']" ).length;
    var div = colors.appendChild( document.createElement( "div" ) );

    var previousColor = colors.querySelectorAll( "div>input[type='color']" )[ length - 1 ]
    //console.log( previousColor );
    if (length < ledCount)
    {
        // add color input
        var color = div.appendChild( document.createElement( "input" ) );
        color.type = "color";
        color.id = "color" + ( length + 1 );
        color.value = previousColor.value;

        color.addEventListener( "input", function( _event )
        {
            document.getElementById( color.id + "_stop" ).style.stopColor = _event.target.value;
            if ( document.getElementById( "autoupdate" ).checked )
                update();
        } );

        // add color stop
        var gradient = document.getElementById( "grad1" );
        var stop = gradient.appendChild( document.createElement( "stop" ) );
        stop.id = "color" + ( length + 1 ) + "_stop"
        stop.style.stopColor = previousColor.value;

        // add 'remove' button
        var button = div.appendChild( document.createElement( "input" ) );
        button.type = "button";
        button.value = "-";
        button.onclick = removeColor;

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
