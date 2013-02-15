var
    initAppWorker;


// Fill the cache for the example
initAppWorker = new SharedWorker("Workers/initApp-sharedWorker.js", "InitApp");

//addHttpRequestHandler('/getRequestCount', 'HttpRequestHandlers/requestCount.js', 'getRequestCount');

storage.PRODUCTION_MODE = true;


