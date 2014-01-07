﻿
include('PRIVATE-SETTING-nogit.js');

function logStatsFromWorker(message, port) {
    var
        data,
        statsMessage,
        xhr;

    data = message.data;

    // stats message
    statsMessage = {
        userID: data.client,
        code: data.code,
        time: data.end - data.begin,
        error: data.error,
   	    serverIP: httpServer.ipAddress
    };

    xhr = new XMLHttpRequest();
    xhr.open('POST', LOG_SERVER_URL, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify(statsMessage));
	if (port.close) {
        port.close();
    }
}


onconnect = function onStatsLogSharedWorker(event) {
    var
        port;

    port = event.ports[0];
    if (port.start) {
    	// port.start() should normaly be called in SharedWorker context
    	port.start();
    }

    port.onmessage = function bindLogStatsFromWorker(event) {
        logStatsFromWorker(event, port);
    };
}