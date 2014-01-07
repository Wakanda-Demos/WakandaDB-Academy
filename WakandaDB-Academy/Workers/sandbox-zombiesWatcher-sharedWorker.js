﻿var
    countInterval,
    delay;

function countZombies() {
    var
        killWorker;

    [].forEach.call(storage, function (item, itemIndex) {
        item = storage.key(index);
        if (item && (typeof item === 'object') && (item.type === 'worker')) {
            if ((Date.now() - item.since) > 180000 /* 5 mn */) {
                nbZombies += 1;
            }
            if (nbZombies > 10) {
                console.warn('Stopping the server: more than 10 threads running from more than 5mn');
                SystemWorker.exec('taskkill /F /IM "Wakanda Server.exe"');
            }
        }
    });

}

delay =  360000; /* 10 mn */

self.onconnect = function onconnect(event) {
    var
        port;
    
    port = event.port[0];
    
    port.onmessage = function onmessage(message) {
        switch (message.data) {

        case 'start':
            countInterval = setInterval(countZombies, delay);
            break;

        case 'stop':
            if (countInterval) {
                clearInterval(countInterval);
            }
            port.postMessage('closed');
            self.close();
            break;

        case 'pause':
            if (countInterval) {
                clearInterval(countInterval);
            }
            port.postMessage('paused');
            break;

        case 'resume':
            countInterval = setInterval(countZombies, delay);
            port.postMessage('resumed');
            break;
        }
    };
};