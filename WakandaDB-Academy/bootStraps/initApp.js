var
    initAppWorker;


storage.PRODUCTION_MODE = false;

initAppWorker = new SharedWorker("Workers/initApp-sharedWorker.js", "InitApp");