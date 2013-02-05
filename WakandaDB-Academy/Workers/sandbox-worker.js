/*jslint es5: true, indent: 4 */

/*global self*/

var
    seen = [];

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

self.onmessage = function onCallToExecute(message) {

    'use strict';

    var
        data,
        sandboxModule,
        sandbox,
        result,
        nativeResult,
        resultType,
        response;

    console.log(message);
    data = message.data;
    sandboxModule = require('wakandaSandbox/index');

    sandbox = new sandboxModule.WakandaSandbox(data.allowedProperties);

    result = sandbox.run(data.jsCode, data.timeout);
    //console.log('sandboxed result', result);

    response = {};

    if (result !== null && typeof result === 'object') {
        nativeResult = sandboxModule.getNativeObject(result);
        response.dirty = (nativeResult !== undefined);
        resultType = Object.prototype.toString.call(nativeResult);
        if (response.dirty) {
            if (nativeResult.getDataClass) {
                // ENTITY OR COLLECTION
                response.dataClass = nativeResult.getDataClass().getName();
                if (resultType === '[object Entity]') {
                    response.entityID = nativeResult.ID;
                }
            } else {
                // DATACLASS
                response.dataClass = nativeResult.getName && nativeResult.getName();
                response.result = nativeResult;
            }
        } else if ((resultType === '[object Undefined]' || resultType === '[object Image]') && result.getPath) {
            // IMAGE
            response.image = result.getPath();
        } else {
            response.result = result;
        }
    } else {
        response.result = result;
    }

    // Special handling for Functions
    // INFO: Not yet fully managed by the Proxy method
    response.isFunction = (typeof response.result === 'function');
    if (response.isFunction) {
        
        if (response.result.prototype) {
        	response.$prototype = Object.keys(response.result.prototype).reduce(
         	   function (outputResult, currentItem){
          	      outputResult[currentItem] = response.result[currentItem];
           	     return outputResult;
            	},
            	{}
        	);
        }

        response.result = Object.keys(response.result).reduce(
              function (outputResult, currentItem){
                outputResult[currentItem] = response.result[currentItem];
                return outputResult;
            },
            {}
        );

        if (response.dataClass) {
            response.result.length = nativeResult.length;
        }

        response.result = JSON.parse(JSON.stringify(response.result, safeStringify));
    }

    // not sure yet if lock is mandatory
    storage.lock();
    storage.removeItem('Worker:' + data.workerID);
    storage.unlock();

    //console.log('returned message', response);
    self.postMessage(response);
    //self.close();
};