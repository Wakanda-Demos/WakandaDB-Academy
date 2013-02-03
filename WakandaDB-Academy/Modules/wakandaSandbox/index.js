/*jslint es5: true, todo: true, indent: 4 */

/*global os, process, application, solution, ds, storage, require, exports*/

//const MAX_ARRAY_INDEXED_ENTITIES_IN_COLLECTIONS = 40;

var
    MAX_ARRAY_INDEXED_ENTITIES_IN_COLLECTIONS,
    sandoxedDatastore,
    sandboxedDataClasses,
    nativeObjects,
    sandboxedObjects,
    Sandbox;

/**
 * UTIL FUNCTIONS
 **/


function accessRestricted(error) {

    "use strict";

    var
        exceptionKey,
        errorObject,
        defaultMessage;

    defaultMessage = 'access restricted to property or method by the sandbox';
    debugger;
    exceptionKey = 'Exception:' + this.getSource();

    switch (typeof error) {
    case 'object':
        if (error === null) {
            errorObject = new Error(defaultMessage);
        } else {
            errorObject = error;
        }
        break;
    case 'string':
        if (error === '') {
            errorObject = new Error(defaultMessage);
        } else {
            errorObject = new Error(error);
        }
        break;
    default:
        errorObject = new Error(defaultMessage);
    }

    storage.lock();
    storage.setItem(exceptionKey, errorObject);
    storage.unlock();

    throw errorObject;
}

function checkJS(item) {
    return item && (typeof item === 'object') && item.hasOwnProperty('allowJavaScript');
}

function getNativeObject(obj) {
    var
        index;

    index = sandboxedObjects.indexOf(obj);
    return nativeObjects[index];
}



/**
 *  SANDBOXES CONSTRUCTORS
 **/


/***
 * ENTITY
 *
 * @constructor
 * @class SandboxedEntity
 * @param {WakandaSandbox} globalSandbox
 * @param {SandboxedDataclass} sandboxedDataclass
 * @param {Entity} entity
 */
function SandboxedEntity(globalSandbox, sandboxedDataclass, entity) {

    var
        properties,
        entityCacheIndex;

    if (entity === null || entity === undefined) {
        return null;
    }

    entityCacheIndex = nativeObjects.indexOf(entity);
    if (entityCacheIndex > -1) {
        return sandboxedObjects[entityCacheIndex];
    }

    // cache object
    nativeObjects.push(entity);
    sandboxedObjects.push(this);

    // PROPERTIES

    properties = {};

    Object.keys(entity).forEach(
        function sandboxedEntityAttibuteAccess(attributeName) {
            properties[attributeName] = {
                get: function getter_attributeValue() {
                    var
                        value,
                        relatedSandBoxedDataclass;

                    //debugger;
                    value = entity[attributeName];
                    if (value !== null && typeof value === "object") {
                        if (value.getDataClass) {
                            // Entity Collection from navigation attribute
                            relatedSandBoxedDataclass = sandboxedDataClasses[value.getDataClass().getName()];
                            if (typeof value.getKey === 'function') {
                                // Entity
                                value = new SandboxedEntity(globalSandbox, relatedSandBoxedDataclass, value);
                            } else {
                                // Collection
                                value = new SandboxedCollection(globalSandbox, relatedSandBoxedDataclass, value);
                            }
                        } else {
                            // Image
                            return value;
                        }
                    }
                    return value;
                },
                enumerable: true
            };
        }
    );

    Object.defineProperties(this, properties);

    // METHODS

    this.getDataClass = function getDataClass() {
        //debugger;
        return sandboxedDataclass;
    };

    this.getKey = function getKey() {
        return entity.getKey();
    };

    this.getModifiedAttributes = function getModifiedAttributes() {
        // this method is safe, it doesn't return attributes but attribute names
        return entity.getModifiedAttributes();
    };

    this.getStamp = function getStamp() {
        return entity.getStamp();
    };

    this.getTimeStamp = function getTimeStamp() {
        return entity.getTimeStamp();
    };

    this.isLoaded = function isLoaded() {
        return entity.isLoaded();
    };

    this.isModified = function isModified() {
        return entity.isModified();
    };

    this.isNew = function isNew() {
        return entity.isNew();
    };

    this.next = function next() {
        return new SandboxedEntity(globalSandbox, sandboxedDataclass, entity.next());
    };

    this.refresh = function refresh() {
        return entity.refresh();
    };

    this.release = function release() {
        return entity.release();
    };

    this.remove = accessRestricted.bind(globalSandbox, 'Access to the "remove" entity method is not allowed');

    this.save = accessRestricted.bind(globalSandbox, 'Access to the "save" entity method is not allowed');

    this.toString = function toString() {
        return entity.toString();
    };

    this.validate = function validate() {
        return entity.validate();
    };
}


/**
 * ENTITY COLLECTION
 *
 * @constructor
 * @class SandboxedCollection
 * @param {WakandaSandbox} globalSandbox
 * @param {SandboxedDataclass} sandboxedDataclass
 * @param {EntityCollection} collection
 */
function SandboxedCollection(globalSandbox, sandboxedDataclass, collection) {

    var
        collectionCacheIndex,
        properties,
        index,
        max;

    function addArrayIndexedPropertyToSandboxedCollection(localIndex) {
        // properties object accessed from closure scope
        properties[localIndex] = {
            get: function getter_collectionArrayIndexedEntity() {
                //debugger;
                return new SandboxedEntity(globalSandbox, sandboxedDataclass, collection[localIndex]);
            },
            enumerable: true
        };
    }

    function addAttributePropertyToSandboxedCollection(attributeName) {
        properties[attributeName] = {
            get: function getter_collectionAttribute() {
                var
                    value,
                    sandboxedDataclass;

                value = collection[attributeName];

                if (value && typeof value === "object") {
                    if (value.distinctValues) {
                        // Collection
                        sandboxedDataclass = sandboxedDataClasses[value.getDataClass().getName()];
                        value = new SandboxedCollection(globalSandbox, sandboxedDataclass, value);
                    }
                }
                return value;
            },
            enumerable: false
        };
    }

    if (!collection || !(typeof collection === "object") || !collection.distinctValues) {
        return null;
    }

    collectionCacheIndex = nativeObjects.indexOf(collection);
    if (collectionCacheIndex > -1) {
        return sandboxedObjects[collectionCacheIndex];
    }

    // cache object
    nativeObjects.push(collection);
    sandboxedObjects.push(this);

    // PROPERTIES

    properties = {
        length: {
            get: function getter_length() {
                return collection.length;
            }
        }/*,
        queryPath: {
            get: function getter_queryPath() {
                return collection.queryPath;
            }
        },
        queryPlan: {
            get: function getter_queryPlan() {
                return collection.queryPlan;
            }
        }*/
    };

    // access to entities by index
    max = Math.min(collection.length, MAX_ARRAY_INDEXED_ENTITIES_IN_COLLECTIONS);
    //debugger;
    for (index = 0; index < max; index += 1) {
        addArrayIndexedPropertyToSandboxedCollection(index);
    }
    //debugger;

    // collection of attribute values
    Object.getOwnPropertyNames(sandboxedDataclass.attributes).forEach(addAttributePropertyToSandboxedCollection);

    Object.defineProperties(this, properties);

    // METHODS

    this.add = function add(toAdd, atTheEnd) {
        collection.add.apply(collection, Array.prototype.slice.call(arguments));
    };

    this.and = function and(collection2) {
        return new SandboxedCollection(globalSandbox, sandboxedDataclass, collection.and(collection2));
    };

    this.average = function average(attribute, distinct) {
        return collection.average.apply(collection, Array.prototype.slice.call(arguments));
    };

    this.compute = function compute(attribute, distinct) {
        return collection.compute.apply(collection, Array.prototype.slice.call(arguments));
    };

    this.count = function count(attribute, distinct) {
        return collection.count.apply(collection, Array.prototype.slice.call(arguments));
    };

    if (collection.hasOwnProperty('drop')) {
        this.drop =  accessRestricted.bind(globalSandbox, 'Access to the "drop" dataclass method is not allowed');
    }

    this.distinctValues = function distinctValues(attribute) {
        return collection.distinctValues.apply(collection, Array.prototype.slice.call(arguments));
    };

    this.filter = function filter() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            accessRestricted.call(globalSandbox, 'Using the filter "allowJavaScript" option is not allowed');
        }

        return new SandboxedCollection(globalSandbox, sandboxedDataclass, collection.filter.apply(collection, args));
    };

    this.find = function find() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            accessRestricted.call(globalSandbox, 'Using the find "allowJavaScript" option is not allowed');
        }

        return new SandboxedEntity(globalSandbox, sandboxedDataclass, collection.find.apply(collection, args));
    };

    this.first = function first() {
        return new SandboxedEntity(globalSandbox, sandboxedDataclass, collection.first());
    };

    this.forEach = function forEach(callback) {
        collection.forEach(
            function collectionForEachCallback(thisArg, iterator) {
                // beware of the automatic save
                // only readonly mode restrict it for now
                callback(
                    new SandboxedEntity(globalSandbox, sandboxedDataclass, thisArg),
                    iterator
                );
            }
        );
    };

    this.getDataClass = function getDataClass() {
        return sandboxedDataclass;
    };

    this.max = function max(attribute) {
        return collection.max(attribute);
    };

    this.min = function min(attribute) {
        return collection.min(attribute);
    };

    this.minus = function minus(collection2) {
        return new SandboxedCollection(globalSandbox, sandboxedDataclass, collection.minus(collection2));
    };

    this.or = function or(collection2) {
        return new SandboxedCollection(globalSandbox, sandboxedDataclass, collection.or(collection2));
    };

    this.orderBy = function orderBy(attributeList, sortOrder) {
        return new SandboxedCollection(globalSandbox, sandboxedDataclass, collection.orderBy(attributeList, sortOrder));
    };

    this.query = function query() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            accessRestricted.call(globalSandbox, 'Using the query "allowJavaScript" option is not allowed');
        }

        return new SandboxedEntity(
            sandboxedDataclass,
            collection.query.apply(collection, args)
        );
    };

    this.remove =  accessRestricted.bind(globalSandbox, 'Access to the "remove" dataclass method is not allowed');

    this.sum = function sum(attribute, distinct) {
        return collection.sum(attribute, distinct);
    };

    this.toArray = function toArray() {
        var
            args;

        args = Array.prototype.slice.call(arguments);

        return collection.toArray.apply(collection, args);
    };

    this.toString = function toString() {
        return collection.toString();
    };
}




/***
 * ATTRIBUTE
 *
 * @constructor
 * @class SandboxedAttribute
 * @param {SandboxedDataclass} sandboxedDataclass
 * @param {Attribute} attribute
 */
function SandboxedAttribute(sandboxedDataclass, attribute) {

    if (!attribute || (typeof attribute !== "object")) {
        return null;
    }

    // PROPERTIES

    this.name = attribute.name;
    this.type = attribute.type;
    this.kind = attribute.kind;
    this.scope = attribute.scope;
    this.indexed = attribute.indexed;
    this.indexType = attribute.indexType;
    this.fullTextIndexed = attribute.fullTextIndexed;
    this.relatedDataclass = attribute.relatedDataclass && sandboxedDataClasses[attribute.relatedDataclass.getName()];
    this.dataclass = sandboxedDataclass;

    // METHODS

    this.getName = function getName() {
        return attribute.getName();
    };

    this.toString = function toString() {
        return attribute.toString();
    };
}


/**
 * DATACLASS
 *
 * @method createSandboxedDataclass
 * @param {WakandaSandbox} globalSandbox
 * @param {SandboxedDatastore} sandboxedDatastore
 * @param {Dataclass} dataclass
 * @returns SandboxedDataclass
 */
function createSandboxedDataclass(globalSandbox, sandboxedDatastore, dataclass) {

    var
        dataclassName,
        attributes,
        cachedAttributes,
        properties;

    // The returned dataclass has to be a function
    function sandboxedDataclass(id) {
        return new SandboxedEntity(globalSandbox, sandboxedDataclass, dataclass(id));
    }

    dataclassName = dataclass.getName();

    if (sandboxedDataClasses.hasOwnProperty(dataclassName)) {
        return sandboxedDataClasses[dataclassName];
    }

    sandboxedDataClasses[dataclassName] = sandboxedDataclass;

    // cache object
    nativeObjects.push(sandboxedDataclass);
    sandboxedObjects.push(this);

    properties = {};
    cachedAttributes = {};

    // PROPERTIES

    Object.keys(dataclass.attributes).forEach(
        function addAttributePropertyDescriptionToSandboxedDataclass(attributeName) {
            properties[attributeName] = {
                get: function sandboxeddataclassAttributeGetter() {
                    if (!cachedAttributes.hasOwnProperty(attributeName)) {
                        cachedAttributes[attributeName] = new SandboxedAttribute(globalSandbox, sandboxedDataclass, dataclass.attributes[attributeName]);
                    }
                    return cachedAttributes[attributeName];
                },
                enumerable: true
            };
        }
    );

    attributes = {};
    Object.defineProperties(attributes, properties);
    Object.defineProperty(
        sandboxedDataclass,
        'attributes',
        {
            value: attributes,
            configurable: true,
            writable: false,
            enumerable: false
        }
    );

    // WARNING: name attribute can not be set as the name property of a function is not writable in ECMAScript 5
    // The sandbox still let it accessible via the 'attributes' dataclass property 
    delete properties.name;
    Object.defineProperties(sandboxedDataclass, properties);

    // WARNING: the length property of a function can unfortunately not be changed
    /*
    Object.defineProperty(
        sandboxedDataclass,
        'length',
        {
            get: function getter_length() {
                return dataclass.length;
            }//,
            //enumerable: false
        }
    );
    */
    // sandboxedDataclass.length = dataclass.length; 


    // METHODS

    sandboxedDataclass.all = function all() {
        return new SandboxedCollection(globalSandbox, sandboxedDataclass, dataclass.all());
    };

    sandboxedDataclass.average = function average(datastoreClassAttribute, distinct) {
        return dataclass.average(datastoreClassAttribute, distinct);
    };

    sandboxedDataclass.compute = function compute(datastoreClassAttribute, distinct) {
        return dataclass.compute(datastoreClassAttribute, distinct);
    };

    sandboxedDataclass.count = function count() {
        return dataclass.count();
    };

    sandboxedDataclass.createEntity = function createEntity() {
        return new SandboxedEntity(globalSandbox, sandboxedDataclass, dataclass.createEntity());
    };

    sandboxedDataclass.createEntityCollection = function createEntityCollection() {
        return new SandboxedCollection(globalSandbox, sandboxedDataclass, dataclass.createEntityCollection());
    };

    sandboxedDataclass.distinctValues = function distinctValues(attribute) {
        return dataclass.distinctValues(attribute);
    };

    sandboxedDataclass.filter = function filter() {
        var
            args;

        args = Array.prototype.slice(arguments, 0);
        if (args.some(checkJS)) {
            accessRestricted.call(globalSandbox, 'Using the filter "allowJavaScript" option is not allowed');
        }

        return new SandboxedCollection(globalSandbox, sandboxedDataclass, dataclass.filter.apply(dataclass, args));
    };

    sandboxedDataclass.find = function find() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            accessRestricted.call(globalSandbox, 'Using the find "allowJavaScript" option is not allowed');
        }

        return new SandboxedEntity(globalSandbox, sandboxedDataclass, dataclass.find.apply(dataclass, args));
    };

    sandboxedDataclass.first = function first() {
        return new SandboxedEntity(globalSandbox, sandboxedDataclass, dataclass.first());
    };

    sandboxedDataclass.forEach = function forEach(callbackFn) {
        dataclass.forEach(
            function datastoreForEachCallback(thisArg, iterator) {
                callbackFn(
                    new SandboxedEntity(globalSandbox, sandboxedDataclass, thisArg),
                    iterator
                );
            }
        );
    };

    // the datastore is in read-only mode
    sandboxedDataclass.fromArray = accessRestricted.bind(globalSandbox, 'Access to the "fromArray" dataclass method is not allowed');

    // we might restrict access if it consume too much resources
    sandboxedDataclass.getFragmentation = function getFragmentation() {
        return dataclass.getFragmentation();
    };

    sandboxedDataclass.getName = function getName() {
        return dataclassName;
    };

    sandboxedDataclass.getScope = function getScope() {
        return dataclass.getScope();
    };

    sandboxedDataclass.max = function max(attribute) {
        return dataclass.max(attribute);
    };

    sandboxedDataclass.min = function min(attribute) {
        return dataclass.min(attribute);
    };

    sandboxedDataclass.orderBy = function orderBy(attributeList, sortOrder) {
        return new SandboxedCollection(globalSandbox, sandboxedDataclass, dataclass.orderBy(attributeList, sortOrder));
    };

    sandboxedDataclass.query = function query() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            accessRestricted.call(globalSandbox, 'Using the query "allowJavaScript" option is not allowed');
        }

        return new SandboxedCollection(globalSandbox, sandboxedDataclass, dataclass.query.apply(dataclass, args));
    };

    // the datastore is in read-only mode
    sandboxedDataclass.remove = accessRestricted.bind(globalSandbox, 'Access to the "remove" dataclass method is not allowed');

    // the datastore is in read-only mode
    sandboxedDataclass.setAutoSequenceNumber = accessRestricted.bind(globalSandbox, 'Access to the "setAutoSequenceNumber" dataclass method is not allowed');

    sandboxedDataclass.sum = function sum(attribute, distinct) {
        return dataclass.sum(attribute, distinct);
    };

    sandboxedDataclass.toArray = function toArray() {
        var
            args;

        args = Array.prototype.slice.call(arguments);

        return dataclass.toArray.apply(dataclass, args);
    };

    sandboxedDataclass.toString = function toString() {
        return dataclass.toString();
    };

    return sandboxedDataclass;

}


/**
 * DATASTORE
 *
 * @constructor
 * @class SandboxedDatastore
 * @param {WakandaSandbox} globalSandbox
 * @param {Datastore} datastore
 */
function SandboxedDatastore(globalSandbox, datastore) {

    var
        properties;

    // PROPERTIES

    properties = {};

    Object.keys(datastore.dataClasses).forEach(
        function (dataclassName) {
            properties[dataclassName] = {
                value: createSandboxedDataclass(globalSandbox, datastore, datastore[dataclassName])
            };
        }
    );

    Object.defineProperties(this, properties);

    // METHODS

    this.close = accessRestricted.bind(globalSandbox, 'Access to the "close" datastore method is not allowed');
    this.flushCache = function flushCache() {
        // the datastore is in readonly, no cache to flush
    };
    this.getDataFolder = accessRestricted.bind(globalSandbox, 'Access to the "getDataFolder" datastore method is not allowed');
    this.getModelFolder = accessRestricted.bind(globalSandbox, 'Access to the "getModelFolder" datastore method is not allowed');
    this.getTempFolder = accessRestricted.bind(globalSandbox, 'Access to the "getTempFolder" datastore method is not allowed');


    this.getName = function getName() {
        return datastore.getName();
    };

}


/**
 * PROCESS
 *
 * @method createSandboxedProcess
 * @param {WakandaSandbox} globalSandbox
 * @returns SandboxedProcess
 */
function createSandboxedProcess(globalSandbox) {
    return {
        buildNumber: process.buildNumber,
        version: process.version,
        userDocuments: accessRestricted.bind(globalSandbox, 'Access to the "userDocuments" process property is not allowed')
    };
}

/**
 * OS
 *
 * @method createSandboxedOs
 * @param {WakandaSandbox} globalSandbox
 * @returns SandboxedOs
 */
function createSandboxedOs(globalSandbox) {
    return {
        isLinux: os.isLinux,
        isMac: os.isMac,
        isWindows: os.isWindows,
        networkInterfaces: accessRestricted.bind(globalSandbox, 'Access to "networkInterfaces" os property is not allowed'),
        type: os.type
    };
}


/**
 * SOLUTION
 *
 * @method createSandboxedSolution
 * @param {WakandaSandbox} globalSandbox
 * @returns SandboxedSolution
 */
function createSandboxedSolution() {
    return {
        name: solution.name
    };
}


/**
 * APPLICATION
 *
 * @constructor
 * @class WakandaSandbox
 * @params {Object} allowedProperties
 */
function WakandaSandbox(allowedProperties) {
    if (allowedProperties.hasOwnProperty('os')) {
        allowedProperties.os = createSandboxedOs(this);
    }
    if (allowedProperties.hasOwnProperty('process')) {
        allowedProperties.process = createSandboxedProcess(this);
    }
    if (allowedProperties.hasOwnProperty('solution')) {
        allowedProperties.process = createSandboxedProcess(this);
    }
    if (allowedProperties.hasOwnProperty('ds')) {
        allowedProperties.ds = new SandboxedDatastore(this, ds);
    }
    Sandbox.call(this, application, allowedProperties);
}


/**
 * MODULE INITIALIZATION
 **/

MAX_ARRAY_INDEXED_ENTITIES_IN_COLLECTIONS = 40;

sandoxedDatastore = {};
sandboxedDataClasses = [];
nativeObjects = [];
sandboxedObjects = [];
Sandbox = require('jsSandbox/index').Sandbox;


/**
 * Run
 *
 * @class WakandaSandbox
 * @method run
 * @params {string} jsCode
 */
Object.defineProperty(
    WakandaSandbox.prototype,
    'run',
    {
        value: Sandbox.prototype.run,
        writable: false,
        configurable: false,
        enumerable: true
    }
);

// TODO: to simplify the sandbox module API
// - make index.js the one that will call the worker 
// - embed the worker in the module package
/*
WakandaSandbox.prototype.run = function(jsCode, timeout) {
    var
        result,
        waiting;

    function callback(sandboxResult) {
        debugger;
        result = sandboxResult;
        waiting = false;
        exitWait();
    }

    waiting = true;
    debugger;
    Sandbox.prototype.run(jsCode, timeout, callback);

    wait(timeout);
    debugger;
    if (waiting) {
        throw new Error('Timeout expired after ' + timeout + ' ms while executing this code:', jsCode);
    }
    return result;
};
*/



/**
 * MODULE PUBLIC API
 **/



/**
 * Get the original object from a sandboxed object returned by the sandbox run method
 *
 * @method getNativeObject
 * @params {Object} sandboxeObject
 * @returns Object
 */
Object.defineProperty(
    exports,
    'getNativeObject',
    {
        value: getNativeObject,
        writable: false,
        configurable: false,
        enumerable: true
    }
);


/**
 * WakandaSandbox constructor
 *
 * @constructor
 * @class WakandaSandbox
 * @params {Object} allowedProperties
 */
Object.defineProperty(
    exports,
    'WakandaSandbox',
    {
        value: WakandaSandbox,
        writable: false,
        configurable: false,
        enumerable: true
    }
);