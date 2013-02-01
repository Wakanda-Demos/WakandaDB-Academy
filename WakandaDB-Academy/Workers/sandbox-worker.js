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

    sandbox = new sandboxModule.WakandaSandbox(data.allowedProperties);

    //debugger;
    result = sandbox.run(data.jsCode, data.timeout);
	//console.log('sandboxed result', result);
	
    response = {};

    if (result !== null && typeof result === 'object') {
        nativeResult = sandboxModule.getNativeObject(result);
        response.dirty = (nativeResult !== undefined);
        resultType = Object.prototype.toString.call(nativeResult);
        if (response.dirty) {
	        //debugger;
	        response.dataClass = nativeResult.getDataClass().getName();
            if (resultType === '[object Entity]') {
	            response.entityID = nativeResult.ID;
	        }
	    } else if ((resultType === '[object Undefined]' || resultType === '[object Image]') && result.getPath) {
	        response.image = result.getPath();
	    } else {
	        response.result = JSON.parse(JSON.stringify(result, safeStringify));
	    }
    } else {
    	response.result = result;
    }

    //debugger;
    //console.log('returned message', response);
    self.postMessage(response);
    //self.close();
};