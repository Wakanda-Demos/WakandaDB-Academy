﻿// Employee fullName

exports.kind = 'calculated';
exports.type = 'string';


exports.onGet = function fullNameOnGet() {
    var
        result;

    result = this.firstName ? [this.firstName] : [];
    if (this.lastName) {
        result.push(this.lastName);
    }
    return result.join(' ');
};


exports.onQuery = function fullNameOnQuery(compOperator, valueToCompare) {
    return "firstName " + compOperator + valueToCompare + " || " + "lastName " + compOperator + valueToCompare;
};


exports.onSort = function fullNameOnSort(ascending) {
    return (ascending ? "firstName, lastName" : "firstName desc, lastName desc");
};