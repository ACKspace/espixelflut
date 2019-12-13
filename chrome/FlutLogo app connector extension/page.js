(function()
{
    chrome.runtime.onMessage.addListener( (request, sender, sendResponse) =>
    {  
        document.dispatchEvent(new CustomEvent('data', { detail: request } ) );
        //sendResponse( "content runtime.onMessage" );
        return true;
    } );
})();
