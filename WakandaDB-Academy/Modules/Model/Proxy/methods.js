
var

    // CONSTANTS
    C = Object.create(null, {
        TIMEOUT: {value: 6000, writable: false}, // 6 sec
        TIMEOUT_DEV: {value: 60, writable: false},// 1 hour
        REMOTE_LOG_MODE: {value: true, writable: false},
        SANDBOXED_MODE: {value: true, writable: false}
    }),

    // variables
    seen;

function safeStringify(key, val) {
    if (typeof val === "object" && val !== null) {
        if (seen.indexOf(val) !== -1) {
            return "recursive reference";
        }
        seen.push(val);
    } else if (typeof val === "function") {
        if (seen.indexOf(val) !== -1) {
            return "recursive reference";
        }
        seen.push("function () {}");
    }
    return val;
}


function createSpecificValueResponse(value, requestID) {
    var
       forceHTTPStream;

    forceHTTPStream = new TextStream(getFolder().path + 'forceHTTPStream');
    return {
        HTTPStream: forceHTTPStream,
        headers: {
           'Content-Type': 'text/plain; charset=x-user-defined',
            'X-Request-ID': requestID,
            'X-Original-Content-Type': 'application/json',
            'X-JSON-Unsupported-JS-Value': String(value)
        }
    };
}

function runOnServer(ssjs, requestID) {
    "use strict";

    var
        exceptionKey,
        errorObject,
        safecode,
        workerID,
        sandboxWorker,
        waiting,
        data,
        sandboxModule,
        sandbox,
        seen,
        response,
        responseReady,
        limitedResult,
        index,
        entity,
        result,
        toString,
        forceHTTPStream,
        stats,
        client,
        ALLOWED_PROPERTIES = {
            // HTML5 properties
            'name': true,
            'Blob': true,
            'sessionStorage': true,
            // node.js properties
            'Buffer': true,
            // Wakanda specific properties
            'administrator': true,
            'dateToIso': true,
            'ds': true,
            'generateUUID': true,
            'getURLQuery': true,
            'guidedModel': true,
            'model': true,
            'isoToDate': true,
            'os': true,
            'pattern': true,
            'process': true,
            'wildchar': true
        };

    function logRequest() {
        var
            privateSettingsFile,
            sharedWorker;

        privateSettingsFile = new File(getFolder().path + 'PRIVATE-SETTING-nogit.js');
        if (!C.REMOTE_LOG_MODE || !privateSettingsFile.exists || !storage.PRODUCTION_MODE) {
            return;
        }
        client = sessionStorage.client;
        if (!client) {
            client = generateUUID();
            sessionStorage.client = client;
        }
        stats.client = client;

        sharedWorker = new SharedWorker('Workers/statslog-sharedworker.js', 'LOG_REQUESTS');
        sharedWorker.port.postMessage(stats);
    }

    if (!ssjs) {
        // return undefined
        return createSpecificValueResponse(undefined);
    }

    //debugger;
    stats = {
        begin: Date.now(),
        code: ssjs
    };
    responseReady = false;

    exceptionKey = 'Exception:' + ssjs;
    errorObject = storage.getItem(exceptionKey);
    if (errorObject) {
        //debugger;
        stats.error = errorObject;
        stats.end = Date.now();
        logRequest();
        throw JSON.parse(errorObject);
    }

    toString = Object.prototype.toString;
    seen = [];

    

    if (C.SANDBOXED_MODE) {

        waiting = true;

        sandboxWorker = new Worker("Workers/sandbox-worker.js");

        sandboxWorker.onmessage = function onSandboxWorkerRunMessage(message) {

            waiting = false;

            sandboxWorker.terminate();

            // WARNING: message can't yet transport entities or collections

            data = message.data;
            if (data.isError) {
                delete data.isError;
                delete data.isFunction;
                delete data.error;
                data.line -= 1;
                sandboxWorker.onerror(message);
            } else {
                result = data.result;
                exitWait();
            }


        };

        sandboxWorker.onerror = function onSandboxWorkerRunException(errorMessage) {

            var
                errorObject;

            waiting = false;
            errorObject =  errorMessage.data || errorMessage;

            stats.error = JSON.stringify(errorObject);
            stats.end = Date.now();
            logRequest();
            //throw errorObject;

            forceHTTPStream = new TextStream(getFolder().path + 'forceHTTPStream');
            result = {
                HTTPStream: forceHTTPStream,
                headers: {
                   'Content-Type': 'text/plain; charset=x-user-defined',
                    'X-Request-ID': requestID,
                    'X-Original-Content-Type': 'application/json',
                    'X-Exception': JSON.stringify(errorObject)
                }
            };
            responseReady = true;

            exitWait();

        };
        workerID = generateUUID();

        // not sure yet if lock is mandatory
        storage.lock();
        storage.setItem('Worker:' + workerID, {type: 'worker', jsCode: ssjs, since: Date.now()});
        storage.unlock();

        sandboxWorker.postMessage({
            jsCode: ssjs,
            workerID: workerID,
            timeout: storage.PRODUCTION_MODE ? (C.TIMEOUT - 100) : C.TIMEOUT_DEV,
            allowedProperties: ALLOWED_PROPERTIES
        });

        if (storage.PRODUCTION_MODE) {
            wait(C.TIMEOUT);
        } else {
            wait();
        }

        if (waiting) {

            stats.error = new Error('Timeout after ' + C.TIMEOUT + 'ms while executing this code: \n' + ssjs);
            stats.end = Date.now();
            logRequest();

            //sandboxWorker.terminate(); // TODO: call it with a force parameter once implemented
            throw stats.error;

        } else {

            if (data.dataClass) {

                if (data.entityID) {
                    // ENTITY
                    result = ds[data.dataClass](data.entityID);
                } else if (data.isCollection) {
                    // COLLECTION
                    // as the execution time was acceptable re-execute in the main thread
                    sandboxModule = require('wakandaSandbox/index');
                    sandbox = new sandboxModule.WakandaSandbox(ALLOWED_PROPERTIES);
                    result = sandboxModule.getNativeObject(sandbox.run(ssjs));
                } else if (data.isAttribute) {
                    // ATTRIBUTE
                    result = ds[data.dataClass][data.name];
                } else {
                    // DATACLASS
                    result = ds[data.dataClass];
                }

            } else if (data.image) {

                // IMAGE
                result = loadImage(data.image);

            } else if (data.dirty) {

                switch (data.name) {
                case 'solution':
                    // SOLUTION
                case 'application':
                    // APPLICATION
                    result = application[data.name];
                    result = JSON.stringify(result, safeStringify);
                    result = JSON.parse(result);
                    break;
                default:
                    // OTHER
                    result = application[data.name];
                }

            }
            
            /*
            if (data.entityID && data.dataClass) {

                // ENTITY
                result = ds[data.dataClass](data.entityID);

            } else if (data.image) {

                // IMAGE
                result = loadImage(data.image);

            } else if (data.dirty) {

                // COLLECTION
                // as the execution time was acceptable re-execute in the main thread
                sandboxModule = require('wakandaSandbox/index');
                sandbox = new sandboxModule.WakandaSandbox(ALLOWED_PROPERTIES);
                result = sandboxModule.getNativeObject(sandbox.run(ssjs));
            }
            */
        }

    } else {

        result = eval(ssjs);

    }

    response = result;

    if (!responseReady) {

        switch (toString.apply(result)) {

        case '[object Entity]':
            // supported by default
            break;

        case '[object EntityCollection]':
            // supported by default
            break;

        // HTTPStream supports Image, Stream (text, binary), and File
        // It doesn't support Blob and Buffer yet
        case '[object Image]':
            response = {
                HTTPStream: result,
                headers: {
                    'Content-Type': 'text/plain; charset=x-user-defined',
                    'X-Request-ID': requestID,
                    'X-Original-Content-Type': 'image/jpeg',
                    'X-Image-Data': JSON.stringify(result)
                }
            };
            break;

        case '[object Array]':
            /*
            if (result.every(function (element) { return isEntity(element); })) {
                // it is an array of entities
                response.type = 'collection';
                response.dataclass = result[0].getDataClass().getName();
                sessionStorage.currentCollection = result.map(function (entity) {return entity.ID});
            }
            */
            if (result.length > 40) {
                limitedResult = [];
                for (index = 0; index < 40; index += 1) {
                    limitedResult.push(result[index]);
                }
                // specific hanfling for values not supported by JSON
                // the HTTPStream value has to be an image or a stream to specify HTTP headers
                forceHTTPStream = new TextStream(getFolder().path + 'forceHTTPStream');
                response = {
                    // prevent exception from recursive references
                    HTTPStream: forceHTTPStream,
                    headers: {
                       'Content-Type': 'text/plain; charset=x-user-defined',
                        'X-Request-ID': requestID,
                        'X-Original-Content-Type': 'application/json',
                        'X-Original-Array-Length': result.length,
                        // prevent exception from recursive references
                        'X-Limited-Array-Value': JSON.parse(JSON.stringify(limitedResult, safeStringify))
                    }
                };
            } else {
                // Short Array
                // prevent exception from recursive references
                response.result = JSON.parse(JSON.stringify(result, safeStringify));
            }
            break;

        case '[object Object]':
            // prevent exception from recursive references
            response = JSON.parse(JSON.stringify(result, safeStringify));
            break;

        default: // scalar value
            if (((typeof result === 'number') && isNaN(result)) || [undefined, Infinity, -Infinity].indexOf(result) > -1) {
                // specific hanfling for values not supported by JSON
                // the HTTPStream value has to be an image or a stream to specify HTTP headers
                response = createSpecificValueResponse(response, requestID);
            }
        }
    }

    stats.end = Date.now();

    logRequest();

    return response;
}

seen = [];

runOnServer.scope = 'public';

exports.runOnServer = runOnServer;