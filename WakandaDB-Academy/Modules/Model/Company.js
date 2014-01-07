﻿var
	Company;

Company = exports;

Company.properties = {
    collectionName: 'Companies'
};

Company.ID = {
    kind: "storage",
    type: "long",
    autosequence: true,
    primKey: true
 };

Company.name = {
    kind: "storage",
    type: "string",
    indexKind: "btree"
 };

Company.revenues = {
    kind: "storage",
    type: "number",
    indexKind: "btree"
 };

Company.employees = {
    kind: "relatedEntities",
    type: "Employees",
    path: "company",
    reversePath: true
 };

Company.manager = {
    kind: "relatedEntity",
    type: "Employee",
    path: "Employee"
 };

Company.countryName = {
    kind: "alias",
    type: "string",
    path: "country.name"
 };

Company.country = {
    kind: "relatedEntity",
    type: "Country",
    path: "Country"
}