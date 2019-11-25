var socket = chrome.sockets.udp;
var connected = false;
var socketId = null;

const defaults = {
    hostname: "192.168.1.234",
    universe: 1,
    ledsPerUniverse: 170,
    ledCount: 200,
    patterns: {}
};
var settings = defaults;

window.addEventListener( "load", function()
{

    let ledNode = document.querySelector( ".panel .leds" );
    let displayNode = document.querySelector( ".panel .displays" );
    let controllerNode = document.querySelector( ".panel .controllers" );
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

    chrome.storage.local.get( Object.keys( defaults ), function( _stored )
    {
        Object.assign( settings, _stored );

        // Host, universe (start), LEDcount, LEDs per universe
        new FancySlider( "universe", (t,n) => { settings.universe = n; updateSettings( ); return n }, displayNode, controllerNode ).value = settings.universe;
        new FancySlider( "LEDs", (t,n) => { settings.ledCount = n; updateSettings( ); return n }, displayNode, controllerNode ).value = settings.ledCount;
        new FancySlider( "LEDs/universe", (t,n) => { settings.ledsPerUniverse = n; updateSettings( ); return n }, displayNode, controllerNode ).value = settings.ledsPerUniverse;

        let generator = new PatternGenerator( displayNode, controllerNode );
        //settings.patterns.forEach( _color => addColor( _color ) );

        let hostNode = document.querySelector( ".panel" ).appendChild( document.createElement( "input" ) );
        hostNode.className = "fancyDisplay";
        hostNode.value = settings.hostname;
        hostNode.addEventListener( "input", function( _event )
        {
            settings.hostname = _event.target.value || defaults.hostname;
            updateSettings();
        } );

        setInterval( () =>
        {
            if ( generator.tick() )
            {
                let ledNodes = ledNode.childNodes;

                // TODO: dynamic packet count
                // Add header
                let arrPacketOdd = "Art-Net".split("").map( function(_c){ return _c.charCodeAt( 0 ) } );
                let arrPacketEven = "Art-Net".split("").map( function(_c){ return _c.charCodeAt( 0 ) } );
                arrPacketOdd.push(  0, 
                                    0x00, 0x50, /* ArtDMX opcode */
                                    14, 0,      /* Protocol version */
                                    0,          /* Sequence */
                                    0,          /* Pyysical */
                                    settings.universe, 0,  /* Universe */
                                    0, 0        /* Length */
                                );
                arrPacketEven.push( 0,
                                    0x00, 0x50, /* ArtDMX opcode */
                                    14, 0,      /* Protocol version */
                                    0,          /* Sequence */
                                    0,          /* Pyysical */
                                    settings.universe + 1, 0, /* Universe */
                                    0, 0        /* Length */
                                );

                for ( let n = 0; n < settings.ledCount; ++n )
                {
                    let color = generator.getLedColor( n );

                    // Update visible pattern
                    if ( n < ledNodes.length )
                    {
                        ledNodes[ n ].style.background = "rgb("+color[0]+","+color[1]+","+color[2]+")";
                    }

                    console.log( color );
                    // TODO: dynamic packet count
                    if ( n > settings.ledsPerUniverse )
                        arrPacketEven.push( color[0], color[1], color[2] );
                    else
                        arrPacketOdd.push( color[0], color[1], color[2] );
                }

                let size;
                size = arrPacketOdd.length - 17;
                arrPacketOdd[ 16 ] = size >> 8;
                arrPacketOdd[ 17 ] = size & 0xff;

                size = arrPacketEven.length - 17;
                arrPacketEven[ 16 ] = size >> 8;
                arrPacketEven[ 17 ] = size & 0xff;

                send( arrPacketOdd );
                //send( arrPacketEven );

            }
        }, 20 );
    } );

} );

function send( _data )
{
    if ( !connected )
        return;

    socket.send( socketId, new Uint8Array( _data ), settings.hostname, 6454, function( sendInfo )
    {
    });
}

function updateSettings( )
{
    // TODO: Do the patterns last-minute

    chrome.storage.local.set( settings, function()
    {
        //console.log( "Settings updated" );
    } );
}

