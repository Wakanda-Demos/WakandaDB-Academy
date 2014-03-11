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
        ECMASCRIPT_PROPERTIES;

    function accessRestricted() {
        return new Error('Access Restricted');
    }

    // a instance must be created to have "this" not bound to the global object
    function Sandbox(globalObject, allowedProperties) {

        "use strict";

        var
            filteredProperties,
            sandbox;

        function filterProperties(propName) {
            var
                property,
                propertyDescriptor;

            property = globalObject[propName];
            propertyDescriptor = Object.getOwnPropertyDescriptor(globalObject, propName);

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
                    propertyDescriptor.value = accessRestricted;
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
                    propertyDescriptor.get = accessRestricted;
                    propertyDescriptor.set = accessRestricted;
                }
            }
            filteredProperties[propName] = propertyDescriptor;

        }

        // this object that will replace the orriginal global application object
        sandbox = this;

        if (typeof allowedProperties === "undefined") {
            allowedProperties = {};
        }

        // set the property filter
        filteredProperties = {};
        Object.getOwnPropertyNames(globalObject)
              .forEach(filterProperties);

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

    return Sandbox;

}());

Object.defineProperty(
    Sandbox.prototype,
    "run",
    {
        value: function runSandboxed() {

            // no local variable are used to prevent from scope pollution

            // handle specific case when try executing an empty string
            if (arguments.length === 0 || arguments[0] === '') {
                return undefined;
            }

            arguments.timer = setTimeout(
                function securedTimeout(timeout, jsCode) {
                    throw new Error('Timeout expired after ' + timeout + ' ms' + 'while executing:\n\n' + jsCode);
                }, 
                arguments[1], // timeout
                arguments[1], // timeout
                arguments[0]  // submitted jsCode
            );

            if (/^[ \t\r\n\v\f]*}/.test(arguments[0])) {
                throw new Error('JS Injection attempt detected in:\n\n' + arguments[0]);
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

            this.arguments = undefined;

            /*
            arguments.result = (new Function([
                'with (this) {',  // where this is the sandbox instance
                    'return (function () {',
                        '"use strict";',
                        'return ' + arguments[0],
                    '}());',
                '}',
            ].join('\n')))();
            */

            arguments.result = eval([
                'with (this) {', // where this is the sandbox instance
                    arguments[0],
                '}'
            ].join('\n'));

            clearTimeout(arguments.timer);
            return arguments.result;

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
