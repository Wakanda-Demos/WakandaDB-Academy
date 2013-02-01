/*jslint es5: true, indent: 4 */

/*global self:true */

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

    //debugger
    sandbox = new sandboxModule.WakandaSandbox(data.allowedProperties);

    result = sandbox.run(data.jsCode, data.timeout);
	//console.log('sandboxed result', result);
	
    response = {};

    if (result !== null && typeof result === 'object') {
        nativeResult = sandboxModule.getNativeObject(result);
        response.dirty = (nativeResult !== undefined);
        resultType = Object.prototype.toString.call(nativeResult);
        //debugger
        if (response.dirty) {
	        //debugger;
	        if (nativeResult.getDataClass) {
    	        response.dataClass = nativeResult.getDataClass().getName();
                if (resultType === '[object Entity]') {
	                response.entityID = nativeResult.ID;
	            }
	        } else {
	        	// dataclass
        	    //debugger;
	        	response.result = nativeResult;
	        }
	    } else if ((resultType === '[object Undefined]' || resultType === '[object Image]') && result.getPath) {
	        response.image = result.getPath();
	    } else {
            response.result = result;
	    }
    } else {
    	response.result = result;
    }

    response.isFunction = (typeof response.result === 'function');
    if (response.isFunction) {
    	response.result = Object.keys(response.result).reduce(
    	    function (outputResult, currentItem){
    	    	outputResult[currentItem] = response.result[currentItem];
    	    	return outputResult;
    	    },
    	    {}
    	);
    	response.result = JSON.parse(JSON.stringify(response.result, safeStringify))
    }
    //debugger;
    //console.log('returned message', response);
    self.postMessage(response);
    //self.close();
};