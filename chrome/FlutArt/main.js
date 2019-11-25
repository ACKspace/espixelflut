chrome.app.runtime.onLaunched.addListener(function( _launchData )
{
    chrome.app.window.create('FlutArt.html',
    {
        // CreateWindowOptions
        id: "mainwin",
        width: 400,
        height: 500
    },
    // Callback
    function( _win )
    {
        _win.contentWindow.launchData = _launchData;
        _win.maximize();
        _win.show();
    });

});
