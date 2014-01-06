const
    COUNT_EMPLOYEES_TO_CREATE = 20000,
    ADMIN_PASSWORD = 'admin';

var
    generator;

self.onconnect = function initAppWorkerOnConnect(event) {

    var
        privateSettingsFile;

    ds.setCacheSize(1024 * 1024 * 1024); // 1 Gb

    // if data empty, generate fake data
    if (ds.Employee.length === 0) {
    	generator = require("fakedata/generator");
    	loginByPassword('admin', ADMIN_PASSWORD);
    	console.info(" ::::: Creating ", COUNT_EMPLOYEES_TO_CREATE, " Employees  Companies...");
    	generator.buildFakeData(COUNT_EMPLOYEES_TO_CREATE, {log: false});
    	console.info(" End creating Employees. Employees: ", ds.Employee.length, ", Companies: ", ds.Company.length, ", Country: ", ds.Country.length, " ::::: ");
    	ds.flushCache();
    }

    // Warm the cache with a sequential query that will load all logs
    console.log('Warming the cache..........');
    try {
    	ds.Employee.query("ID > 0");
    	ds.Company.query("ID > 0");
    	ds.Country.query("ID > 0");
    } catch(err) {
    	// just ignore this error
    	console.warn('query failed:', err);
    }
    console.log('Warming the cache..........done');

    if (storage.PRODUCTION_MODE) {
    	privateSettingsFile = File(getFolder().path + 'PRIVATE-SETTING-nogit.js'); 
    	if (privateSettingsFile.exists) {
    		addHttpRequestHandler('/getRequestCount', 'HttpRequestHandlers/requestCount.js', 'getRequestCount');
    	}
    }

    console.log('close the initApp shared worker');
    self.close();
};