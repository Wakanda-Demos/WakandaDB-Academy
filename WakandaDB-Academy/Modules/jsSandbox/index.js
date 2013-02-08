/*jslint evil:true */

var
    Sandbox;

// polyfill of the ECMAScript 5 Function bind() method
if (!Function.prototype.hasOwnProperty("bind")) {
    Function.prototype.bind = function (context) {

        "use strict";

        var
            argsAsArray,
            slice,
            functionToBind,
            boundFunction;

        function Nop() {}

        if (typeof this !== "function") {
            throw new TypeError("Bind must be called on a function");
        }

        functionToBind = this;
        Nop.prototype = this.prototype;
        slice = Array.prototype.slice;

        argsAsArray = slice.call(arguments, 1);

        boundFunction = function boundFunction() {

            var
                result;

            return functionToBind.apply(
                this instanceof Nop && context ? this : context,
                argsAsArray.concat(
                    slice.call(arguments)
                )
            );

        };
        boundFunction.prototype = new Nop();

        return boundFunction;
    };
}

Sandbox = (function SandBoxScope() {

    // create the Sandbox constructor in a specific scope not accessible by its run() method
    // it prevents from closure scope pollution 

    var
        ECMASCRIPT_PROPERTIES,
        FILENAME;


    function AccessRestrictedError(message, lineNumber) {
        message = message || 'Access restricted to property or method by the sandbox';
        Error.call(this, message);
        this.name = 'AccessRestrictedError';
        this.message = message;
        this.fileName = FILENAME;
        //this.lineNumber = lineNumber;
    }

    AccessRestrictedError.prototype = Object.create(Error.prototype);
    AccessRestrictedError.prototype.constructor = AccessRestrictedError;

    function accessRestricted(error) {

        "use strict";

        var
            exceptionKey,
            errorObject,
            errorType,
            defaultMessage,
            message;

        exceptionKey = 'Exception:' + this.getSource();

        switch (typeof error) {
        case 'object':
            if (error === null) {
            message = defaultMessage;
                errorObject = new AccessRestrictedError(defaultMessage);
            } else {
                message = error.message;
                errorObject = error;
            }
            break;
        case 'string':
            message = (error === '') ? defaultMessage : error;
            errorObject = new AccessRestrictedError(message);
            break;
        default:
            message = defaultMessage;
            errorObject = new AccessRestrictedError(defaultMessage);
        }

        storage.lock();
        storage.setItem(exceptionKey, JSON.stringify(errorObject));
        storage.unlock();

        throw errorObject;
    }

    // a instance must be created to have "this" not bound to the global object
    function Sandbox(globalObject, allowedProperties) {

        "use strict";

        var
            filteredProperties,
            sandbox,
            chain;

        function filterProperties(propName) {
            var
                property,
                propertyType,
                propertyDescriptor;

            property = globalObject[propName];
            propertyType = typeof property;
            propertyDescriptor = Object.getOwnPropertyDescriptor(globalObject, propName);
            if (!propertyDescriptor) {
                propertyDescriptor = {
                    value: property,
                    enumerable: (propertyType !== 'function') && !this.isPrototype
                };
            }

            if (property === globalObject) {
                // global object reccursive reference
                delete propertyDescriptor.get;
                delete propertyDescriptor.set;
                propertyDescriptor.value = sandbox;
            } else if (['object', 'function'].indexOf(typeof allowedProperties[propName]) > -1) {
                // the allowed property by a proposed sandboxed one
                delete propertyDescriptor.get;
                delete propertyDescriptor.set;
                propertyDescriptor.value = allowedProperties[propName];
            } else if (typeof property === 'function') {
                // Handle methods
                delete propertyDescriptor.get;
                delete propertyDescriptor.set;
                if (!allowedProperties.hasOwnProperty(propName) && !ECMASCRIPT_PROPERTIES.hasOwnProperty(propName)) {
                    // unallowed method replaced by an invokable function
                    propertyDescriptor.value = accessRestricted.bind(sandbox, 'Access to the "' + propName + '" method is not allowed');
                } else if (propName[0] !== propName[0].toUpperCase()) {
                    // if not itself a constructor, it might require the original application context
                    propertyDescriptor.value = property.bind(application);
                }
            } else {
                // Handle properties
                if (!allowedProperties.hasOwnProperty(propName) && !ECMASCRIPT_PROPERTIES.hasOwnProperty(propName)) {
                    // unallowed properties replaced by one with getter and setter returning "access restricted"
                    delete propertyDescriptor.value;
                    delete propertyDescriptor.writable;
                    propertyDescriptor.get = accessRestricted.bind(sandbox, 'Access to the "' + propName + '" property is not allowed');
                    propertyDescriptor.set = accessRestricted.bind(sandbox, 'Access to the "' + propName + '" property is not allowed');
                }
            }
            filteredProperties[propName] = propertyDescriptor;

        }

        // this object that will replace the orriginal global application object
        sandbox = this;
        //debugger;

        if (typeof allowedProperties === "undefined") {
            allowedProperties = {};
        }

        // initialize the property filter
        filteredProperties = {};

        // mask access to all the prototype chain properties and methods
        chain = globalObject;
        do {
        	Object.getOwnPropertyNames(chain).forEach(
        	    filterProperties, 
        	    {isPrototype: chain !== globalObject}
        	);
            chain = chain.__proto__;
        } while (chain !== Object.prototype);

        // apply the property filter to the global object mask
        Object.defineProperties(
            sandbox,
            filteredProperties
        );

    }

    // declare ECMAScript 5.1 accessible global properties
    ECMASCRIPT_PROPERTIES = {
        'Array': true,
        'Boolean': true,
        'Date': true,
        'Error': true,
        'EvalError': true,
        'Function': true,
        'Infinity': true,
        'JSON': true,
        'Math': true,
        'NaN': true,
        'Number': true,
        'Object': true,
        'RangeError': true,
        'ReferenceError': true,
        'RegExp': true,
        'String': true,
        'SyntaxError': true,
        'TypeError': true,
        'URIError': true,
        'decodeURI': true,
        'decodeURIComponent': true,
        'encodeURI': true,
        'encodeURIComponent': true,
        'escape': true,
        'eval': true,
        'isFinite': true,
        'isNaN': true,
        'parseFloat': true,
        'parseInt': true,
        'undefined': true,
        'unescape': true
    };

    FILENAME = 'jsSandbox/index';

    return Sandbox;

}());

Object.defineProperty(
    Sandbox.prototype,
    "run",
    {
        value: function runSandboxed() {

            // no variable are used to prevent from scope pollution
            // handle specific case when try executing an empty string
            if (arguments.length > 1) {
                arguments.timer = setTimeout(
                    function securedTimeout(timeout, jsCode) {
                        throw new Error('Timeout expired after ' + timeout + ' ms' + 'while executing:\n' + jsCode);
                    }, 
                    arguments[1], arguments[1], arguments[0]
                );
            }

            Object.defineProperty(
                this,
                'getSource',
                {
                    value: (
                        function sandbox_getJsCode(jsCode) {
                            return jsCode;
                        }
                    ).bind(this, arguments[0]),
                    writable: false,
                    configurable: false,
                    enumerable: false
                }
            );

            if (arguments.length === 0 || arguments[0] === '') {
                return undefined;
            } else {
                //arguments[0] = arguments[0].split('\n');
                //arguments[0].splice(arguments[0]);
                this.arguments = undefined;
                /*
                arguments.result = eval(
                    'with (this) {\nfunction forceStrict(){\n"use strict";\n\n' +
                    arguments[0] +
                    '\n}\n}'
                ) */;
                arguments.result = eval('with (this) {\n' + arguments[0] + '\n}');
                clearTimeout(arguments.timer);
                return arguments.result
            }

        },
        writable: false,
        configurable: false,
        enumerable: false
    }
);

//Object.freeze(Sandbox);

Object.defineProperty(
    exports,
    'Sandbox',
    {
        value: Sandbox,
        writable: false,
        configurable: false,
        enumerable: true
    }
);