// dev:     icceojmopojknaihgbgjohghppcaooao
// runtime: kanholleanfcldcpcdmgjndibhkofjck
var appConnectorId = "kanholleanfcldcpcdmgjndibhkofjck";


(function()
{
    var socket = chrome.sockets && chrome.sockets.udp;
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

    if ( !chrome.storage )
    {
        chrome.storage = {
            local:
            {
                get: ( v, f ) =>
                {
                    f( [ ] );
                },
                set: () =>
                {
                }
            }
        }
    }




/*
    setInterval( (e) =>
    {
        chrome.runtime.sendMessage( appConnectorId, [ 0,255,255,0,0,255,0,255,255,0,0,255,0,255,255, 255, 0, 255 ], (response) => 
        {
            console.log("app response " + response);
        });
    }, 2000 );
*/
    document.addEventListener('DOMContentLoaded', () =>
    {
        var manifestData = chrome.runtime.getManifest();
        document.querySelector( ".title" ).textContent = manifestData.name;

        var local = "0.0.0.0";
        socket && socket.create( {}, function( socketInfo )
        {
            // The socket is created, now we can send some data
            socketId = socketInfo.socketId;

            //TODO: chrome.sockets.udp.joinGroup(integer socketId, string address, function callback)
            socket.onReceive.addListener( ( packet ) =>
            {
                chrome.runtime.sendMessage( appConnectorId, Array.from( new Uint8Array( packet.data ) ).slice( 18 ) );
            } );

            socket.bind( socketId, local, 6454, function( connectResult )
            {
                connected = (connectResult == 0);
                console.log( "connected" );

            } );
        });

        chrome.storage.local.get( Object.keys( defaults ), function( _stored )
        {
            Object.assign( settings, _stored );

            /*
            let hostNode = document.querySelector( ".panel" ).appendChild( document.createElement( "input" ) );
            hostNode.className = "fancyDisplay";
            hostNode.value = settings.hostname;
            hostNode.addEventListener( "input", function( _event )
            {
                settings.hostname = _event.target.value || defaults.hostname;
                updateSettings();
            } );
            */

        } );


    } );

    function updateSettings( )
    {
        // TODO: Do the patterns last-minute

        chrome.storage.local.set( settings, function()
        {
            //console.log( "Settings updated" );
        } );
    }

})();


