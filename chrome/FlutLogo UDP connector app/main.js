chrome.app.runtime.onLaunched.addListener(function( _launchData )
{
    chrome.app.window.create('app.html',
    {
        // CreateWindowOptions
        id: "mainwin",
        width: 350,
        height: 90
    },
    // Callback
    function( _win )
    {
        _win.contentWindow.launchData = _launchData;
        //_win.maximize();
        _win.show();
    });

});
