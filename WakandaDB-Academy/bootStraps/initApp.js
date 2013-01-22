var
    worker;

ds.setCacheSize(1024 * 1024 * 1024);

// Fill the cache for the example
worker = new SharedWorker("Workers/initAppInSharedWorker.js", "InitApp");

