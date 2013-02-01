/*jslint es5: true, white: true, indent: 4 */

/*global Worker, wait, exitWait*/

guidedModel =// @startlock
{
	Proxy :
	{
		methods :
		{// @endlock
            runOnServer: function (ssjs)
			{// @lock
                "use strict";

                var // "const" doesn't work in strict mode
                    TIMEOUT = 4000,
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
                        'isoToDate': true,
                        'os': true,
                        'pattern': true,
                        'process': true,
                        'wildchar': true
                    };

                var
                    sandboxWorker,
                    waiting,
                    data,
                    sandboxModule,
                    sandbox,
                    seen,
                    response,
                    limitedResult,
                    index,
                    entity,
                    result,
                    toString,
                    forceHTTPStream;

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

                if (!ssjs) {
                    return 'code empty';
                    //throw new Error('code empty');	
                }

                toString = Object.prototype.toString;
                seen = [];
                waiting = true;

                sandboxWorker = new Worker("Workers/sandbox-worker.js");

                sandboxWorker.onmessage = function onSandboxWorkerRunMessage(message) {

                    waiting = false;
                    //debugger;
                    sandboxWorker.terminate();

                    // WARNING: message can't yet transport entities or collections

                    data = message.data;

                    result = data.result;
                    exitWait();

                };

                sandboxWorker.postMessage({
                    jsCode: ssjs,
                    timeout: (TIMEOUT - 100),
                    allowedProperties: ALLOWED_PROPERTIES
                });

                wait(TIMEOUT);

                if (waiting) {

                    //sandboxWorker.terminate(); // TODO: call it with a force parameter once implemented
                    throw new Error('Timeout after ' + TIMEOUT + 'ms while executing this code: \n' + ssjs);

                } else if (data.entityID && data.dataClass) {

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

                response = result;

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
                        forceHTTPStream = new TextStream(getFolder().path + 'forceHTTPStream');
                        response = {
                            HTTPStream: forceHTTPStream,
                            headers: {
                               'Content-Type': 'text/plain; charset=x-user-defined',
                                'X-Original-Content-Type': 'application/json',
                                'X-JSON-Unsupported-JS-Value': String(result)
                            }
                        };
                    }
                }

                return response;
			}// @startlock
		}
	},
	Employee :
	{
		age :
		{
			onSort:function(ascending)
			{// @endlock
                "use strict";

                return (ascending ? "birthDate desc" : "birthDate");
			},// @startlock
			onQuery:function(compOperator, valueToCompare)
			{// @endlock
                "use strict";

                var
                    not,
                    birthYearFromAgePlusOne,
                    lowerlimit,
                    upperlimit,
                    result;

                if (valueToCompare === null) {

                    not = ["=", "=="].indexOf(compOperator) > -1 ? 'not' : '';
                    result = "birthDate is" + not + 'null';

                } else {

                    upperlimit = new Date();
                    birthYearFromAgePlusOne = upperlimit.getFullYear() - valueToCompare;
                    upperlimit.setFullYear(birthYearFromAgePlusOne);

                    lowerlimit = new Date();
                    lowerlimit.setFullYear(birthYearFromAgePlusOne - 1);

                    switch (compOperator) {
                    case '=':
                    case '==':
                    case '!=':
                    case '!==':
                        result = "birthDate >= '" + lowerlimit.toISOString() + "'";
                        result += " and birthDate < '" + upperlimit.toISOString() + "'";
                        if (['!=', '!=='].indexOf(compOperator) > -1) {
                            result = "not (" + result + ")";
                        }
                        break;

                    case '>':
                        result = "birthDate < '" + lowerlimit.toISOString() + "'";
                        break;

                    case '>=':
                        result = "birthDate <= '" + upperlimit.toISOString() + "'";
                        break;

                    case '<':
                        result = "birthDate > '" + upperlimit.toISOString() + "'";
                        break;

                    case '<=':
                        result = "birthDate >= '" + lowerlimit.toISOString() + "'";
                        break;

                    default:
                        console.warn('unknown operator:', compOperator);
                        result = null;
                    }
                }

                return result;
			},// @startlock
			onGet:function()
			{// @endlock
                "use strict";

                var
                    today,
                    interval,
                    nbYears,
                    age;

                if (this.birthDate === null || this.birthDate === undefined) {
                    age = 0;
                } else {
                    today = new Date();
                    interval = today.getTime() - this.birthDate.getTime();
                    nbYears = Math.floor(interval / (1000 * 60 * 60 * 24 * 365.25));

                    age = nbYears;
                }

                return age;
			}// @startlock
		},
		fullName :
		{
			onQuery:function(compOperator, valueToCompare)
			{// @endlock
				"use strict";

                return "firstName " + compOperator + valueToCompare + " || " + "lastName " + compOperator + valueToCompare;
			},// @startlock
			onSort:function(ascending)
			{// @endlock
				"use strict";

                return (ascending ? "firstName, lastName" : "firstName desc, lastName desc");
			},// @startlock
			onGet:function()
			{// @endlock
                "use strict";

                return this.firstName + " " + this.lastName;
			}// @startlock
		}
	}
};// @endlock

