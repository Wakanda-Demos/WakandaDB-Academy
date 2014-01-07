﻿var
    assert;

assert = require('assert');
sandbox = new (require('wakandaSandbox').WakandaSandbox)();

exports['Test sandboxed global object different from the real global object'] = function () {
    assert.notEquals(sandbox.run('application;'), application);
}

exports['Test this different from the global object'] =  function () {
    assert.notEquals(sandbox.run('this;'), application);
}

exports['Test sandboxed global is same reference as this'] =  function () {
    assert.equals(sandbox.run('application === this'), true);
}

exports['Test recursive sandboxed global reference'] =  function () {
    assert.equals(sandbox.run('application === application.application'), true);
}