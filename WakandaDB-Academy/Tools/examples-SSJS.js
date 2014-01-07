//ds.Company.length + " / " + ds.Employee.length
//ds.Employee.query('manager is null').first().manager === null
//var comp = ds.Company.find('name = B@')
//comp
//comp.employees

//var comps = ds.Company.query('country.name = "France" and revenues < 1000');
//var comps = ds.Company.query('countryName = "France" and revenues < 1000');
//comps.length
//comps.employees.length;
//comps.employees.toArray('lastName');
//comps.employees.query('salary < 50000');

//var emps_1 = ds.Employee.query('company.country.name = France');
//var emps_2 = ds.Country.find('name = France').allCompanies.employees
//emps_1.length + " / " + emps_2.length


// What are  the revenues in the US?
// Example 1
//ds.Company.query('countryName = USA').sum('revenues');
// Example 2
//ds.Country.query('name = USA').allCompanies.sum('revenues');

// ================================================ CLASS METHOD
// Calling a collection method
//ds.Company.all().revenuesStats({kind: 'byCountry'})


// ================================================ CALCULATED ATTR
// Display age
//ds.Employee.first();
//ds.Employee.query('age < 30').length;
//ds.Company.query('employees.age < 25').length;
// Nombre d'employés de plus de 60ans employés par une société française
//ds.Company.query('countryName = France').employees.query('age >= 60').length
// Nombre de sociétés françaises employant des gens de plus de 60 ans
//ds.Company.query('countryName = France and employees.age >= 60').length
