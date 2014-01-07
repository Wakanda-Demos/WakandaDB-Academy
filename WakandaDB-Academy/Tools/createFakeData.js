const
	COUNT_EMPLOYEES_TO_CREATE = 20000,
	ADMIN_PASSWORD = 'admin';

var
	startDate,
	endDate,
	duration,
	generator;

generator = require("fakedata/generator");
startDate = new Date();

console.info("Start of log: ", startDate);
console.info(" ::::: Creating ", COUNT_EMPLOYEES_TO_CREATE, " Employees  Companies...");

loginByPassword('admin', ADMIN_PASSWORD);

generator.buildFakeData(COUNT_EMPLOYEES_TO_CREATE, {log:false});

ds.flushCache();

console.info(" End creating Employees. Employees: ", ds.Employee.length, ", Companies: ", ds.Company.length, ", Country: ", ds.Country.length, " ::::: ");

endDate = new Date();
duration = endDate - startDate;
console.info("DURATION: ", duration, " ms");

// show the execution time in the studio output
duration = String(duration);
