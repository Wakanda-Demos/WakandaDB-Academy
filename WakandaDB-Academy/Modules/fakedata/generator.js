﻿/*global module: true, exports: true */

var
    BEFORE_FLUSH,
    baseFolder,
    txtBaseFolder,
    imgBaseFolder,
    photoPrefix,
    fakeData;

if (typeof exports === 'undefined') {
    exports = {};
    module = {uri: ''};
}

BEFORE_FLUSH = 500;

/**
 * @private
 * @method randomInteger
 * @param {number} min
 * @param {number} max
 * @returns number
 **/
function randomInteger(min, max) {
    var
        result;

    result = Math.round(min + (Math.random() * (max - min)));
    return result;
}

/**
 * @private
 * @method buildFullPath
 * @param {string} fileName
 * @returns string
 **/
function buildFullPath(fileName) {
    var
        path;

    path = txtBaseFolder;
    if (path.charAt(path.length - 1) !== '/') {
        path += '/';
    }

    return path + fileName;
}

/**
 * Imports the lines of a text file into an array
 * 
 * @private
 * @method importInArray
 * @param {string} fileName
 * @returns Array
 **/
function importInArray(fileName) {
    var
        result,
        input,
        line;

    result = [];
    input = new TextStream(buildFullPath(fileName), "read");
    while (!input.end()) {
        line = input.read("\n");
        if (line !== "") {
            if (line.charAt(line.length - 1) === "\r") {
                line = line.slice(0, -1);
            }
            result.push(line);
        }
    }
    input.close();
    return result;
}

/**
 * Imports Male and Female firstNames from tsv file into the fakeData object
 * 
 * @private
 * @method importFirstNames
 **/
function importFirstNames() {
    fakeData.firstNamesMale = importInArray("FirstNames-Male.txt");
    fakeData.firstNamesFemale = importInArray("FirstNames-Female.txt");
}

/**
 * Imports lastnames from tsv file into the fakeData object
 * 
 * @private
 * @method importLastNames
 **/
function importLastNames() {
    fakeData.lastNames = importInArray("LastNames.txt");
}

/**
 * Imports Countries from tsv file into the fakeData object
 * 
 * @private
 * @method importCountries
 **/
function importCountries() {
    var
        countries,
        input,
        line,
        triplet, // name, code2Chars, weight
        randomTable,
        weight;

    input = new TextStream(buildFullPath("Countries.txt"), "read");
    countries = [];
    countries.randomTable = [];

    while (!input.end()) {
        line = input.read("\n");
        if (line !== "") {
            if (line.charAt(line.length - 1) === "\r") {
                line = line.slice(0, -1);
            }
            triplet = line.split("\t");
            countries.push({
                name: triplet[0],
                code2Chars: triplet[1]
            });
            // generate randomTable from the weight of the country for companies repartition
            weight = triplet[2];
            randomTable = [];
            do {
                randomTable.push(triplet[1]);
                weight -= 1;
            } while (weight);
            countries.randomTable = countries.randomTable.concat(randomTable);
        }
    }
    input.close();
    fakeData.countries = countries;
}

/**
 * Imports Company name parts from tsv file into the fakeData object
 * 
 * @private
 * @method importCompanies
 **/
function importCompanies() {
    var
        input,
        line,
        triplet;

    input = new TextStream(buildFullPath("Companies.txt"), "read");
    fakeData.comp1 = [];
    fakeData.comp2 = [];
    fakeData.comp3 = [];

    while (!input.end()) {
        line = input.read("\n");
        if (line !== "") {
            if (line.charAt(line.length - 1) === "\r") {
                line = line.slice(0, -1);
            }
            triplet = line.split("\t");
            fakeData.comp1.push(triplet[0]);
            fakeData.comp2.push(triplet[1]);
            fakeData.comp3.push(triplet[2]);
        }
    }
    input.close();
}

/**
 * Generate a random company name from the loaded name parts
 * 
 * @private
 * @method buildFakeCompanyName
 * @returns string
 **/
function buildFakeCompanyName() {
    var
        x1,
        x2,
        x3;

    x1 = randomInteger(0, fakeData.comp1.length - 1);
    x2 = randomInteger(0, fakeData.comp2.length - 1);
    x3 = randomInteger(0, fakeData.comp3.length - 1);

    return [fakeData.comp1[x1], fakeData.comp2[x2], fakeData.comp3[x3]].join(' ');
}

/**
 * Select a random gender with adequate firstname
 * 
 * @private
 * @method selectRandomGenderAndFirstName
 * @returns string
 **/
function selectRandomGenderAndFirstName() {
    var
        x,
        result;

    result = {
        firstName: ''
    };

    if (Math.random() > 0.5) {
        // Man
        result.gender = 'M';
        x = randomInteger(0, fakeData.firstNamesMale.length - 1);
        result.firstName = fakeData.firstNamesMale[x];
    } else {
        // Woman
        result.gender = 'F';
        x = randomInteger(0, fakeData.firstNamesFemale.length - 1);
        result.firstName = fakeData.firstNamesFemale[x];
    }

    return result;
}

/**
 * Select a random lastname
 * 
 * @private
 * @method selectRandomLastName
 * @returns string
 **/
function selectRandomLastName() {
    var
        x,
        result;

    x = randomInteger(0, fakeData.lastNames.length - 1);
    result = fakeData.lastNames[x];
    return result;
}

/**
 * Create and save countries in the db
 * 
 * @private
 * @method createCountries
 **/
function createCountries() {
    var
        map,
        countries,
        randomTable;

    // http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
    map = {};
    countries = fakeData.countries;
    countries.forEach(function createCountry(countryData) {
        var
            country;

        country = new ds.Country(countryData);
        map[countryData.code2Chars] = country;
        country.save();
    });
    // update the random country table for direct entity access
    randomTable = countries.randomTable;
    countries.randomTable = randomTable.map(function replaceCountryCodeByEntity(countryCode) {
        return map[countryCode];
    });
}


/**
 * Create random country table
 * 
 * @private
 * @method createCountries
 **/
function createRandomCountryTable() {
    var
        map,
        countries,
        randomTable;

    map = {};
    countries = fakeData.countries;
    countries.forEach(function createCountry(countryData) {
        var
            country;

        country = new ds.Country.find('code2Chars == :1', countryData.code2Chars);
        map[countryData.code2Chars] = country;
    });
    // update the random country table for direct entity access
    randomTable = countries.randomTable;
    countries.randomTable = randomTable.map(function replaceCountryCodeByEntity(countryCode) {
        return map[countryCode];
    });
}


/**
 * Create and save an employee in the db
 * 
 * @private
 * @method createEmployee
 * @param {ds.Company} company
 * @param {ds.Manager} manager
 * @param {string} title
 * @returns {ds.Manager} manager
 **/
function createEmployee(company, manager, title) {
    var
        randomData,
        lastName,
        salary,
        employee,
        photoName;

    randomData = selectRandomGenderAndFirstName();
    lastName = selectRandomLastName();
    // random salary inferior to the anager salary
    if (manager === null) {
        salary = randomInteger(120000, 150000);
    } else if (manager.title === 'President') {
        salary = randomInteger(70000, manager.salary / 1.5);
    } else if (manager.title === 'CEO') {
        salary = randomInteger(40000, manager.salary / 1.5);
    } else {
        salary = randomInteger(5000, manager.salary / 1.5);
    }
    // create the employee
    ds.startTransaction();
    try {
        employee = new ds.Employee({
            firstName: randomData.firstName,
            lastName: lastName,
            gender: randomData.gender,
            manager: manager,
            title: title,
            salary: salary,
            birthDate: new Date(randomInteger(1950, 1991), randomInteger(0, 11), randomInteger(1, 28)),
            company: company
        });
        employee.save();
        // select a random picture based on the employee ID
        photoName = '000' + ((employee.ID % 150) + 1);
        photoName = photoName.substr(photoName.length - 3);
        employee.photo = photoPrefix[employee.gender] + photoName + '.jpg';
        employee.save();
        if (manager === null) {
            company.manager = employee;
            company.save();
        }
        ds.commit();
    } catch (error) {
        console.error('error', error.messages, error, ' on createEmployee(', company, manager, title, ')');
        ds.rollBack();
    }

    return employee;
}

/**
 * Build and Save the fake data
 * 
 * @public
 * @method buildFakeData
 * @param {number} [nbEmployeesToCreate] default: 100000
 * @param {Objet} [options] default: {remove: true, log: false, errorLog: true}
 **/
function buildFakeData(nbEmployeesToCreate, options) {

	var
	    nbCreatedEmployees,
	    nbCompanyEmployees,
	    nbCompanyCreatedEmployees,
	    nbDirectionEmployees,
	    empsToCreateLessThan10000,
	    maxPerComp,
	    rand,
	    companyName,
	    company,
	    managerTitles,
	    managerLongTitles,
	    staffTitle,
	    president,
	    ceo,
	    manager,
	    revenues,
	    i,
	    randomCountryTable,
	    maxCountry,
	    country,
	    beforeFlush;

    options = options || {};
    options.remove = (typeof options.remove === 'boolean') ? options.remove : true;
    options.log = (typeof options.log === 'boolean') ? options.log : false;
    options.errorLog = (typeof options.errorLog === 'boolean') ? options.errorLog : true;

    fakeData = {};
    empsToCreateLessThan10000 = nbEmployeesToCreate < 10000;

    importCountries();
    importCompanies();
    importFirstNames();
    importLastNames();

    // Delete what you're re-creating
    if (options.remove) {
	    ds.Employee.remove();
	    ds.Employee.setAutoSequenceNumber(1);
	    ds.Company.remove();
	    ds.Company.setAutoSequenceNumber(1);
	    ds.Country.remove();
	    ds.Country.setAutoSequenceNumber(1);
    }

    if (ds.Country.length === 0) {
        createCountries();
    } else {
        createRandomCountryTable();
    }

    randomCountryTable = fakeData.countries.randomTable;
    maxCountry = randomCountryTable.length - 1;

    managerTitles = ["CAO", "CTO", "CFO", "CMO", "CQO", "CPO"];
    managerLongTitles = [
        "Chief Administrative Officer",
        "Chief Technical Officer",
        "Chief Financial Officer",
        "Chief Marketing Officer",
        "Chief Quality Officer",
        "Chief Purchase Officer"
    ];
    staffTitle = {
        CAO: 'Accountant',
        CTO: 'Software Developper',
        CFO: 'Commercial',
        CMO: 'Marketing Manager',
        CQO: 'Quality Engineer',
        CPO: 'Business Developer'
    };

    nbEmployeesToCreate = Number(nbEmployeesToCreate);
    if (isNaN(nbEmployeesToCreate) || nbEmployeesToCreate === 0) {
        nbEmployeesToCreate = 100000;
    }

    nbCreatedEmployees = 0;
    beforeFlush = BEFORE_FLUSH;

    // loop in which we will create companies until the number of employees is reached
    while (ds.Employee.length < nbEmployeesToCreate) {

        nbCompanyCreatedEmployees = 0;

        // Determine the count of employees to create for this company
        rand = Math.random();

        if (rand > 0.98) {
            nbCompanyEmployees = randomInteger(101, empsToCreateLessThan10000 ? 150 : randomInteger(101, 2000));
        } else if (rand > 0.95) {
            nbCompanyEmployees = randomInteger(70, 100);
        } else if (rand > 0.9) {
            nbCompanyEmployees = randomInteger(40, 69);
        } else if (rand > 0.8) {
            nbCompanyEmployees = randomInteger(20, 39);
        } else if (rand > 0.7) {
            nbCompanyEmployees = randomInteger(10, 19);
        } else {
            nbCompanyEmployees = randomInteger(1, 10);
        }

        if (nbEmployeesToCreate < (nbCreatedEmployees + nbCompanyEmployees)) {
            nbCompanyEmployees = nbEmployeesToCreate - nbCreatedEmployees;
        }

        try {

	        // Create the company
	        companyName = buildFakeCompanyName();
	        revenues = randomInteger(0, randomInteger(10000, 500000));
	        country = randomCountryTable[randomInteger(0, maxCountry)];

	        ds.startTransaction();
	        if (options.log) {
	            console.log('creating company', companyName, ' with ', nbCompanyEmployees, 'employees');
	        }
	        company = new ds.Company({
	            name: companyName,
	            revenues: revenues,
	            country: country
	        });
	        company.save();

	        // create the main managers
	        ceo = createEmployee(company, null, "CEO");
	        nbCompanyCreatedEmployees += 1;

	        if (nbCompanyEmployees > 80) {
	            president = createEmployee(company, null, "President");
	            // company.manager is set in createEmployee
	            // company.manager = president;
	            // company.save();
	            nbCompanyCreatedEmployees += 1;
	            if (nbCompanyEmployees > 150) {
		            ceo.manager = createEmployee(company, president, "Vice-President");
		            ceo.save();
		            nbCompanyCreatedEmployees += 1;
		        } else {
		            ceo.manager = president;
	                ceo.save();
		        }
		        president.release();
		        president = null;
	        } else {
	            // company.manager is set in createEmployee
	            //company.manager = ceo;
	            //company.save();
	        }

	        // second level managers

	        // employees repartition per direction
	        nbDirectionEmployees = (nbCompanyEmployees - nbCompanyCreatedEmployees) / managerTitles.length;
	        nbDirectionEmployees = parseInt(nbDirectionEmployees, 10);
	        managerTitles.every(
	            function createManager(managerTitle) {
	                var
	                    manager,
	                    employee,
	                    nbEmployeesLeft;

	                nbEmployeesLeft = nbCompanyEmployees - nbCompanyCreatedEmployees;
	                if (nbDirectionEmployees > nbEmployeesLeft) {
	                    nbDirectionEmployees = nbEmployeesLeft;
	                }
	                // create the direction manager
	                manager = createEmployee(company, ceo, managerTitle);
	                // create the employees of this direction
			        for (i = 0; i < nbDirectionEmployees; i += 1) {
			            employee = createEmployee(company, manager, staffTitle[managerTitle]);
			            employee.release();
			        }
			        manager.release();
			        manager = null;

			        return (nbEmployeesLeft > 0);

	            }
	        );

	        ds.commit();

	        if (options.log) {
	            console.log('Company', companyName, ' created:', company);
	        }

	        ceo.release();
	        ceo = null;
	        company.release();
	        company = null;

	        nbCompanyCreatedEmployees += managerTitles.length;
	        nbCreatedEmployees += nbCompanyEmployees;
	    } catch (error) {
	        if (options.errorLog) {
	            console.error("Company failed", error.messages, error, company);
	        }
	    }

	    // Periodically flush the data on disc
	    beforeFlush -= 1;
	    if (beforeFlush < 1) {
	        ds.flushCache();
	        beforeFlush = BEFORE_FLUSH;
	    }

    } // while(nbCreatedEmployees < nbEmployeesToCreate)

    //fixCompaniesManager();

    return true;
}

/**
 * Fix the manager attribute of companies
 * it setting this attribute during employees creation generation lock errors
 * 
 * @public
 * @method fixCompaniesManager
 **/
function fixCompaniesManager() {
	ds.Employee.filter('manager == null').forEach(
	    function setMainManagerToCompany(manager) {
	        var
	            company;

	        company = manager.company;
	        company.manager = manager;
	        company.save();
	    }
	);
}

/**
 * Specify the folder in with is stored the fake text data
 * 
 * @public
 * @method setTxtBaseFolder
 * @param {string} folder
 **/
function setTxtBaseFolder(folder) {
    txtBaseFolder = folder;
}

/**
 * Specify the folder in with is stored the fake text data
 * 
 * @public
 * @method setTxtBaseFolder
 * @param {string} folder
 **/
function setImgBaseFolder(folder) {
    imgBaseFolder = folder;
    photoPrefix = {
        M: imgBaseFolder + 'Men/Man_',
        F: imgBaseFolder + 'Women/Woman_'
    };
}

// TODO: remove the OS test once module.uri correctly implemented on Windows
baseFolder = new File(os.isWindows ? module.id + '.js' : module.uri).parent.path;

setTxtBaseFolder(baseFolder + 'files/');
setImgBaseFolder(baseFolder + 'photos/');

// exports the public module API
exports.setTxtBaseFolder = setTxtBaseFolder;
exports.setImgBaseFolder = setImgBaseFolder;
exports.buildFakeData = buildFakeData;
exports.fixCompaniesManager = fixCompaniesManager;
