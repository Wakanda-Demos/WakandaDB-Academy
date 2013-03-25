/*jslint es5: true, indent: 4 */

/*global self*/

var
    seen = [],
    cache = [];

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

function createTransportableFunction(func) {
    var
        result;
    
    result = {
        isFunction: true,
        name: func.name,
        length: func.length,
        source: func.toString(),
        properties: filterProperties(func),
        $prototype: filterProperties(func.prototype)
    };
    return result;
}

function filterProperties(obj) {
    var
        result,
        cacheIndex;

    function filterArrayItem(value) {
        var
            isFunction;

        isFunction = typeof value === 'function';
        if (isFunction || ((typeof value === "object")  && value !== null)) {
            cacheIndex = seen.indexOf(value)
            if (cacheIndex !== -1) {
                value = cache[cacheIndex];
            } else {
                seen.push(value);
                if (isFunction) {
                    value = createTransportableFunction(value);
                } else {
                    value = filterProperties(value);
                }
                cache.push(value);
            }
        }
        return value;

    }

    function filterObjProperty(propertyName) {
        var
            value,
            isFunction;

        value = obj[propertyName];
        if (propertyName !== 'prototype') {
            isFunction = typeof value === 'function';
            if (isFunction || ((typeof value === "object")  && value !== null)) {
                cacheIndex = seen.indexOf(value)
                if (cacheIndex !== -1) {
                    value = cache[cacheIndex];
                } else {
                    seen.push(value);
                    if (isFunction) {
                        value = createTransportableFunction(value);
                    } else {
                        value = filterProperties(value);
                    }
                    cache.push(value);
                }
            }
            result[propertyName] = value;
        }
    }

    if (obj instanceof Array) {
        result = obj.map(filterArrayItem);
    } else {
        result = {};
        Object.getOwnPropertyNames(obj).forEach(filterObjProperty);
    }
    return result;
}

self.onmessage = function onCallToExecute(message) {

    'use strict';

    var
        data,
        propertyList,
        allowedProperties,
        sandboxModule,
        sandbox,
        result,
        nativeResult,
        resultType,
        response;

    console.log(message);
    data = message.data;
    propertyList = data.allowedProperties;
    sandboxModule = require('wakandaSandbox/index');

    // DO SAFER CLONE
    allowedProperties = {};
    Object.keys(propertyList).forEach(function (propName) {
        var
            value;
        
        value = propertyList[propName];
        if (typeof value !== 'function') {
            allowedProperties[propName] = value;
        } else {;
            console.error('wrong property type', propName, value);
            allowedProperties[propName] = true
        }
    });
    
    sandbox = new sandboxModule.WakandaSandbox(allowedProperties);
    response = {};

    try {
    	result = sandbox.run(data.jsCode, data.timeout);
    } catch (error) {
    	response = {
    		name: error.name,
    		message: error.message,
    		messages: error.messages,
    		line: error.line,
    		sourceId: error.sourceId,
    		sourceURL: error.sourceURL,
    		isError: true,
    		error: error
    	};

        storage.lock();
        storage.removeItem('Worker:' + data.workerID);
        storage.unlock();
        self.postMessage(response);
        return;
    }


    if (result !== null && typeof result === 'object') {
        nativeResult = sandboxModule.getNativeObject(result);
        response.dirty = (nativeResult !== undefined);
        resultType = Object.prototype.toString.call(nativeResult);
        if (response.dirty) {
            if (nativeResult.getDataClass) {
                response.dataClass = nativeResult.getDataClass().getName();
                switch (resultType) {
                case '[object Entity]':
                    // ENTITY
                    response.entityID = nativeResult.ID;
                    break;
                case '[object Collection]':
                case '[object EntityCollection]':
                    // COLLECTION
                    response.isCollection = true;
                    break;
                default:
                    // ATTRIBUTE
                    response.isAttribute = true;
                    response.name = nativeResult.getName();
                }
            } else if (resultType === '[object Datastore]') {
                // DATASTORE
                response.name = 'ds';
            } else if (nativeResult.getName) {
                // DATACLASS
                response.dataClass = nativeResult.getName && nativeResult.getName();
                //response.result = createTransportableFunction(nativeResult);
                //response.result.length = nativeResult.length;
            } else {
                // OTHER
                switch (nativeResult) {
                case os:
                    response.name = 'os';
                    break;
                case process:
                    response.name = 'process';
                    break;
                case solution:
                    response.name = 'solution';
                    break;
                case application:
                    response.name = 'application';
                    break;
                }
            }
        } else if ((resultType === '[object Undefined]' || resultType === '[object Image]') && result.getPath) {
            // IMAGE
            response.image = result.getPath();
        } else {
            // OBJECT 
            response.result = filterProperties(result);
        }
    } else if (typeof result === 'function') {
        // FUNCTION
        response.result = createTransportableFunction(result);
    } else {
        // STRING, NUMBER, BOOLEAN, NULL, OR UNDEFINED
        response.result = result;
    }

    // Special handling for Functions
    // INFO: Not yet fully managed by the Proxy method
    /*
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
    */

    // not sure yet if lock is mandatory
    storage.lock();
    storage.removeItem('Worker:' + data.workerID);
    storage.unlock();

    //console.log('returned message', response);
    self.postMessage(response);
};