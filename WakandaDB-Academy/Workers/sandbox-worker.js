/*jslint es5: true, indent: 4 */

/*global self:true */

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

	//debugger;
	console.log(message);
	data = message.data;
	sandboxModule = require('wakandaSandbox/index');

    sandbox = new sandboxModule.WakandaSandbox(data.allowedProperties);

    //debugger;
    result = sandbox.run(data.jsCode, data.timeout);
	//console.log('sandboxed result', result);
	
    response = {};

    if (typeof result === 'object') {
        nativeResult = sandboxModule.getNativeObject(result);
        response.dirty = (nativeResult !== undefined);
        if (response.dirty) {
	        response.dataClass = result.getDataClass().getName();
            resultType = Object.prototype.toString.call(nativeResult);
            if (resultType === '[object Entity]') {
	            response.entityID = result.ID;
	        }
	    } else {
	        response.result = result;
	    }
    } else {
    	response.result = result;
    }

    //debugger;
    //console.log('returned message', response);
    self.postMessage(response);
    //self.close();
};