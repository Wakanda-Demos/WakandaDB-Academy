var
	Country;

Country = exports;

Country.properties = {
    collectionName: 'Countries'
};

Country.ID = {
    kind: "storage",
    type: "long",
    autosequence: true,
    primKey: true
};

Country.name = {
    kind: "storage",
    type: "string",
    indexKind: "cluster",
    unique: true,
    identifying: true
};

Country.code2Chars = {
    kind: "storage",
    type: "string",
    indexKind: "cluster"
};

Country.companies = {
    kind: "relatedEntities",
    type: "Companies",
    path: "country",
    reversePath: true
};