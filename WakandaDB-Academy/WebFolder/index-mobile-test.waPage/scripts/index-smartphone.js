
WAF.onAfterInit = function onAfterInit() {// @lock
	
	var
	    VIEWS,
	    ssjsEditor;

// @region namespaceDeclaration// @startlock
	var imageKeepInTouch = {};	// @image
	var imageButton5 = {};	// @buttonImage
	var imageButton4 = {};	// @buttonImage
	var imageButtonModel = {};	// @buttonImage
	var imageButtonHome = {};	// @buttonImage
// @endregion// @endlock

    VIEWS = {
    	HOME: 1,
    	MODEL: 2,
    	EXAMPLES: 3,
    	EDIT_RUN: 4,
    	KEEP_IN_TOUCH: 7
    };


	examplesList = [
        {icon: "", code: "ds.Employee.count()", tip:"Get the number of entities related to a dataclass"},
        {icon: "", code: "ds.Employee.all()", tip:"Get all the entities related to a dataclass"},
        {icon: "", code: "ds.Employee.query('age < :1', 25)", tip:"Get the employees who are older than 25"},
        {icon: "", code: "ds.Employee.query('age < :1', 25).length", tip:"Get the number of employees who are older than 25"},
//        {icon: "", code: "ds.Employee.age"},
        {icon: "", code: "handler = guidedModel.Employee.age.onGet;\n// retrieved the age calculated attribute getter\n// split its source as array to make it readable\nhandler.toString().split('\\r\\n')"},
        {icon: "", code: "ds.Employee.all()[0]"},
        {icon: "", code: "ds.Employee.all().first()"},
        {icon: "", code: "ds.Employee.first()"},
        {icon: "", code: "ds.Employee.first().next()"},
        {icon: "", code: "ds.Employee(5)"},
        {icon: "", code: "ds.Employee(5).company"},
        {icon: "", code: "ds.Employee(5).company.country"},
        //{icon: "", code: "ds.Employee(5).company.country.name"},
        {icon: "", code: "ds.Employee(5).company.countryName"},
        {icon: "", code: "ds.Employee(5).company.country.companies.length"},
        {icon: "", code: "ds.Employee(5).manager"},
        {icon: "", code: "ds.Employee(5).company.manager"},
        {icon: "", code: "ds.Company.query('country.name == :1', 'Japan')"},
        {icon: "", code: "ds.Company(3).employees"},
        {icon: "", code: "ds.Company.query('countryName == USA').compute('revenues')"},
        {icon: "", code: "ds.Country.find('name == Brazil')"},
        {icon: "", code: "ds.Country.find('name == Brazil').companies"}
    ];
    WAF.sources.examplesList.sync();
    
    // ace objects accessible by components via WDB_ACADEMY namespace
    ssjsEditor = ace.edit(WAF.widgets.containerSsjsEditor.id);

    // Editor initialisation
    ssjsEditor.setTheme("ace/theme/github");
    ssjsEditor.getSession().setMode("ace/mode/javascript");
    /*
    ssjsEditor.commands.addCommand({
        name: 'Run',
        bindKey: {win: 'Shift-Return',  mac: 'Shift-Return'},
        exec: buttonRunSSJS.click
    });
    */

// eventHandlers// @lock

	imageKeepInTouch.click = function imageKeepInTouch_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(VIEWS.KEEP_IN_TOUCH);
	};// @lock

	imageButton5.click = function imageButton5_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(VIEWS.EDIT_RUN);
	};// @lock

	imageButton4.click = function imageButton4_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(VIEWS.EXAMPLES);
	};// @lock

	imageButtonModel.click = function imageButtonModel_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(VIEWS.MODEL);
	};// @lock

	imageButtonHome.click = function imageButtonHome_click (event)// @startlock
	{// @endlock
		WAF.widgets.navigationView.goToView(VIEWS.HOME);
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("imageKeepInTouch", "click", imageKeepInTouch.click, "WAF");
	WAF.addListener("imageButton5", "click", imageButton5.click, "WAF");
	WAF.addListener("imageButton4", "click", imageButton4.click, "WAF");
	WAF.addListener("imageButtonModel", "click", imageButtonModel.click, "WAF");
	WAF.addListener("imageButtonHome", "click", imageButtonHome.click, "WAF");
// @endregion
};// @endlock
