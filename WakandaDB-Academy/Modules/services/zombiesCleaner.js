﻿var
    started,
    paused;

started = false;
paused = false;

exports.postMessage = function postMessage(message) {

    var
        settings,
        autostart;

    switch (message.name) {

    case "applicationWillStart":
        settings = storage.services.zombiesCleaner;
        autostart = settings.autoStart;
        if (autostart) {
            exports.start();
        }
        break;

    case "httpServerDidStart":
        break;

    case "httpServerWillStop":
        break;

    case "applicationWillStop":
        break;

    default:
        console.warn('unknown message type:', message.name);
    }

};


exports.start = function start() {
    sandboxZombiesWatcherWorker = new SharedWorker("Workers/sandbox-zombiesWatcher-sharedWorker.js", "SandboxZombiesWatcher");
    sandboxZombiesWatcherWorker.postMessage('start');
    started = true;
};


exports.stop = function stop() {
    sandboxZombiesWatcherWorker = new SharedWorker("Workers/sandbox-zombiesWatcher-sharedWorker.js", "SandboxZombiesWatcher");
    sandboxZombiesWatcherWorker.postMessage('stop');
    sandboxZombiesWatcherWorker.onmessage = function onPauseMessage(message) {
        if (message.data === 'stopped') {
            started = false;
        }
    };
};


exports.isStarted = function isStarted() {
    return started;
};


exports.pause = function pause() {
    sandboxZombiesWatcherWorker = new SharedWorker("Workers/sandbox-zombiesWatcher-sharedWorker.js", "SandboxZombiesWatcher");
    sandboxZombiesWatcherWorker.postMessage('pause');
    sandboxZombiesWatcherWorker.onmessage = function onPauseMessage(message) {
        if (message.data === 'paused') {
            paused = true;
        }
    };
};


exports.resume = function resume() {
    sandboxZombiesWatcherWorker = new SharedWorker("Workers/sandbox-zombiesWatcher-sharedWorker.js", "SandboxZombiesWatcher");
    sandboxZombiesWatcherWorker.postMessage('resume');
    sandboxZombiesWatcherWorker.onmessage = function onResumeMessage(message) {
        if (message.data === 'resumed') {
            paused = false;
        }
    };
};