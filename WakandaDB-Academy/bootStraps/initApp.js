var
    initAppWorker;

ds.setCacheSize(1024 * 1024 * 1024); // 1 Gb

// Fill the cache for the example
initAppWorker = new SharedWorker("Workers/initApp-sharedWorker.js", "InitApp");

addHttpRequestHandler('/getRequestCount', 'ssjs.js', 'getRequestCount');
