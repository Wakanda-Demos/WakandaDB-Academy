var
	Employee;

Employee = exports;

Employee.properties = {
    collectionName: 'Employees'
};

Employee.ID = {
    kind: "storage",
    type: "long",
    autosequence: true,
    primKey: true
};

Employee.firstName = {
    kind: "storage",
    type: "string",
    indexKind: "btree"
};

Employee.lastName = {
    kind: "storage",
    type: "string",
    indexKind: "btree"
};

Employee.gender = {
    kind: "storage",
    type: "string",
    index: "cluster"
};

// calculated attribute
Employee.fullName = require('./fullName');

Employee.company = {
    kind: "relatedEntity",
    type: "Company",
    path: "Company"
};

Employee.salary = {
    kind: "storage",
    type: "number",
    indexKind: "btree"
};

Employee.companyName = {
    kind: "alias",
    type: "string",
    path: "company.name"
};

Employee.birthDate = {
    kind: "storage",
    type: "date",
    indexKind: "btree"
};

// calculated attribute
Employee.age = require('./age');

Employee.photo = {
    kind: "storage",
    type: "image"
};

Employee.title = {
    kind: "storage",
    type: "string",
    indexKind: "cluster"
};

Employee.manager = {
    kind: "relatedEntity",
    type: "Employee",
    path: "Employee"
};

Employee.staff = {
    kind: "relatedEntities",
    type: "Employees",
    path: "manager",
    reversePath: true
};

Employee.managedCompanies = {
    kind: "relatedEntities",
    type: "Companies",
    path: "manager",
    reversePath: true
};