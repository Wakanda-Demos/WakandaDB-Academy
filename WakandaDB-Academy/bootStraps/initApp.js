var
    initAppWorker;


storage.PRODUCTION_MODE = true;

initAppWorker = new SharedWorker("Workers/initApp-sharedWorker.js", "InitApp");