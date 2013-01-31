/*jslint es5: true, todo: true, node: true, indent: 4 */

/*global os, process, application, solution, ds*/

"use strict";


var
    MAX_ARRAY_INDEXED_ENTITIES_IN_COLLECTIONS,
    sandoxedDatastore,
    sandoxedDataClasses,
    nativeObjects,
    sandboxedObjects,
    Sandbox;



/**
 * UTIL FUNCTIONS
 **/


function accessRestricted() {
    throw new Error("access restricted to property or method by the sandbox");
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
    this.relatedDataclass = attribute.relatedDataclass && sandoxedDataClasses[attribute.relatedDataclass.getName()];
    this.dataclass = sandboxedDataclass;

    // METHODS

    this.getName = function getName() {
        return attribute.getName();
    };

    this.toString = function toString() {
        return attribute.toString();
    };
}


/***
 * ENTITY
 *
 * @constructor
 * @class SandboxedEntity
 * @param {SandboxedDataclass} sandboxedDataclass
 * @param {Entity} entity
 */
function SandboxedEntity(sandboxedDataclass, entity) {

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
                	    value;
                	value = entity[attributeName];
                	if (value !== null && typeof value === "object") {
                	    // Entity or Collection from navigation attribute
                	    if (typeof value.getKey === 'function') {
                	    	// Entity
                	    	value = new SandboxedEntity(sandboxedDataclass, value);
                	    } else {
                	    	// Collection
                	    	value = new SandboxedCollection(sandboxedDataclass, value);
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
        return new SandboxedEntity(
            sandboxedDataclass,
            entity.next()
        );
    };

    this.refresh = function refresh() {
        return entity.refresh();
    };

    this.release = function release() {
        return entity.release();
    };

    this.remove = accessRestricted;

    this.save = accessRestricted;

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
 * @param {SandboxedDataclass} sandboxedDataclass
 * @param {EntityCollection} collection
 */
function SandboxedCollection(sandboxedDataclass, collection) {

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
                return new SandboxedEntity(sandboxedDataclass, collection[localIndex]);
            },
            enumerable: true
        };
    }

    function addAttributePropertyToSandboxedCollection(attributeName) {
        properties[attributeName] = {
            get: function getter_collectionAttribute() {
                var
                    result;

                result = collection[attributeName];
                if (result && (typeof result === "object") && result.distinctValues) {
                    result = new SandboxedCollection(sandboxedDataclass, result);
                } else {
                    result = null;
                }
                return result;
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
        return new SandboxedCollection(
            sandboxedDataclass,
            collection.and(collection2)
        );
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
        this.drop = function drop() {
            collection.drop();
        };
    }

    this.distinctValues = function distinctValues(attribute) {
        return collection.distinctValues.apply(collection, Array.prototype.slice.call(arguments));
    };

    this.filter = function filter() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            throw new Error('Option forbidden');
        }

        return new SandboxedCollection(
            sandboxedDataclass,
            collection.filter.apply(collection, args)
        );
    };

    this.find = function find() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            throw new Error('Option forbidden');
        }

        return new SandboxedEntity(
            sandboxedDataclass,
            collection.find.apply(collection, args)
        );
    };

    this.first = function first() {
        return new SandboxedEntity(
            sandboxedDataclass,
            collection.first()
        );
    };

    this.forEach = function forEach(callback) {
        collection.forEach(
            function collectionForEachCallback(thisArg, iterator) {
                // beware of the automatic save
                // only readonly mode restrict it for now
                callback(
                    new SandboxedEntity(
                        sandboxedDataclass,
                        thisArg
                    ),
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
        return new SandboxedCollection(
            sandboxedDataclass,
            collection.minus(collection2)
        );
    };

    this.or = function or(collection2) {
        return new SandboxedCollection(
            sandboxedDataclass,
            collection.or(collection2)
        );
    };

    this.orderBy = function orderBy(attributeList, sortOrder) {
        return new SandboxedCollection(
            sandboxedDataclass,
            collection.orderBy(attributeList, sortOrder)
        );
    };

    this.query = function query() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            throw new Error('Option forbidden');
        }

        return new SandboxedEntity(
            sandboxedDataclass,
            collection.query.apply(collection, args)
        );
    };

    this.remove = accessRestricted;

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

/**
 * DATACLASS
 *
 * @method createSandboxedDataclass
 * @param {SandboxedDatastore} sandboxedDatastore
 * @param {Dataclass} dataclass
 * @returns SandboxedDataclass
 */
function createSandboxedDataclass(sandboxedDatastore, dataclass) {

    var
        dataclassName,
        attributes,
        cachedAttributes,
        properties;

    // The returned dataclass has to be a function
    function sandboxedDataclass(id) {
        return new SandboxedEntity(sandboxedDataclass, dataclass(id));
    }

    dataclassName = dataclass.getName();

    if (sandoxedDataClasses.hasOwnProperty(dataclassName)) {
        return sandoxedDataClasses[dataclassName];
    }

    sandoxedDataClasses[dataclassName] = sandboxedDataclass;

    properties = {};
    cachedAttributes = {};

    // PROPERTIES

    Object.keys(dataclass.attributes).forEach(
        function (attributeName) {
            properties[attributeName] = {
                get: function () {
                    if (!cachedAttributes.hasOwnProperty(attributeName)) {
                        cachedAttributes[attributeName] = new SandboxedAttribute(sandboxedDataclass, dataclass.attributes[attributeName]);
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
        return new SandboxedCollection(
            sandboxedDataclass,
            dataclass.all()
        );
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
        return new SandboxedEntity(
            sandboxedDataclass,
            dataclass.createEntity()
        );
    };

    sandboxedDataclass.createEntityCollection = function createEntityCollection() {
        return new SandboxedCollection(
            sandboxedDataclass,
            dataclass.createEntityCollection()
        );
    };

    sandboxedDataclass.distinctValues = function distinctValues(attribute) {
        return dataclass.distinctValues(attribute);
    };

    sandboxedDataclass.filter = function filter() {
        var
            args;

        args = Array.prototype.slice(arguments, 0);
        if (args.some(checkJS)) {
            throw new Error('Option forbidden');
        }

        return new SandboxedCollection(
            sandboxedDataclass,
            dataclass.filter.apply(dataclass, args)
        );
    };

    sandboxedDataclass.find = function find() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            throw new Error('Option forbidden');
        }

        return new SandboxedEntity(
            sandboxedDataclass,
            dataclass.find.apply(dataclass, args)
        );
    };

    sandboxedDataclass.first = function first() {
        return new SandboxedEntity(
            sandboxedDataclass,
            dataclass.first()
        );
    };

    sandboxedDataclass.forEach = function forEach(callbackFn) {
        dataclass.forEach(
            function datastoreForEachCallback(thisArg, iterator) {
                callbackFn(
                    new SandboxedEntity(
                        sandboxedDataclass,
                        thisArg
                    ),
                    iterator
                );
            }
        );
    };

    // the datastore is in read-only mode
    sandboxedDataclass.fromArray = accessRestricted;

    // we might restrict access it it consume too much resources
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
        return new SandboxedCollection(
            sandboxedDataclass,
            dataclass.orderBy(attributeList, sortOrder)
        );
    };

    sandboxedDataclass.query = function query() {
        var
            args;

        args = Array.prototype.slice.call(arguments);
        if (args.some(checkJS)) {
            throw new Error('Option forbidden');
        }

        return new SandboxedCollection(
            sandboxedDataclass,
            dataclass.query.apply(dataclass, args)
        );
    };

    // the datastore is in read-only mode
    sandboxedDataclass.remove = accessRestricted;

    // the datastore is in read-only mode
    sandboxedDataclass.setAutoSequenceNumber = accessRestricted;

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
 * @param {Datastore} datastore
 */
function SandboxedDatastore(datastore) {

    var
        properties;

    // PROPERTIES

    properties = {};

    Object.keys(datastore.dataClasses).forEach(
        function (dataclassName) {
            properties[dataclassName] = {
                value: createSandboxedDataclass(datastore, datastore[dataclassName])
            };
        }
    );

    Object.defineProperties(this, properties);

    // METHODS

    this.close = accessRestricted;
    this.flushCache = function flushCache() {
        // the datastore is in readonly, no cache to flush
    };
    this.getDataFolder = accessRestricted;
    this.getModelFolder = accessRestricted;
    this.getTempFolder = accessRestricted;

    this.getName = function () {
        return datastore.getName();
    };

}


/**
 * PROCESS
 *
 * @method createSandboxedProcess
 * @returns SandboxedProcess
 */
function createSandboxedProcess() {
    return {
        buildNumber: process.buildNumber,
        version: process.version,
        userDocuments: accessRestricted
    };
}

/**
 * OS
 *
 * @method createSandboxedOs
 * @returns SandboxedOs
 */
function createSandboxedOs() {
    return {
        isLinux: os.isLinux,
        isMac: os.isMac,
        isWindows: os.isWindows,
        networkInterfaces: accessRestricted,
        type: os.type
    };
}


/**
 * SOLUTION
 *
 * @method createSandboxedSolution
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
        allowedProperties.os = createSandboxedOs();
    }
    if (allowedProperties.hasOwnProperty('process')) {
        allowedProperties.process = createSandboxedProcess();
    }
    if (allowedProperties.hasOwnProperty('solution')) {
        allowedProperties.process = createSandboxedProcess();
    }
    if (allowedProperties.hasOwnProperty('ds')) {
        allowedProperties.ds = new SandboxedDatastore(ds);
    }
    Sandbox.call(this, application, allowedProperties);
}


/**
 * MODULE INITIALIZATION
 **/

MAX_ARRAY_INDEXED_ENTITIES_IN_COLLECTIONS = 40;

sandoxedDatastore = {};
sandoxedDataClasses = [];
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