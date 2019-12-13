(function()
{
    chrome.runtime.onMessageExternal.addListener( (request, sender, sendResponse) =>
    {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) =>
        {
            // No tabs if out of focus
            if ( tabs.length )
            {
                chrome.tabs.sendMessage(tabs[0].id, request, (response) =>
                {
                    //sendResponse( "runtime.onMessageExternal " + response );
                });
            }
        });

        return true;
    } );
})();

