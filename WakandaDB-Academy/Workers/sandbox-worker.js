
onmessage = function on(message) {
	
	var
	    result,
	    nativeResult,
	    ssjs,
	    resulType,
	    dirty,
	    response;

	//debugger;
	console.log(message);
	ssjs = message.data;
	sandboxModule = require('wakandaSandbox/index');
    sandbox = new sandboxModule.WakandaSandbox(
		//application,
		{
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
			'isoToDate': true,
			'os': true,
			'pattern': true,
			'process': true,
			'wildchar': true
		}
	);

    response = {};

    result = sandbox.run(ssjs, 3000);
	//console.log('sandboxed result', result);
	
    if (typeof result === 'object') {
    	nativeResult = sandboxModule.getNativeObject(result);
        response.dirty = (nativeResult !== undefined);
        if (response.dirty) {
            resultType = Object.prototype.toString.call(nativeResult);
            if (resultType === '[object Entity]') {
	    	    response.entityID = result.ID;
	    	    response.dataClass = result.getDataClass().getName();
	        }
	    } else {
	    	response.result = result;
	    }
    }

    //debugger;
    //console.log('returned message', response);
    postMessage(response);
}