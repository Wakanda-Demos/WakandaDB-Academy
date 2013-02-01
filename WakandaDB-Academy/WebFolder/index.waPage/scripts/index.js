/*jslint es5: true, nomen: true, todo: false, vars: true, white: true, browser: true, indent: 4 */

var
    WAF,
    ds,
    sources,
    ace,
    encode64,
    // local sources
    statusText, 
    countryLocation, 
    jsCode,
    examplesList;

WAF.onAfterInit = function onAfterInit() {// @lock

    "use strict";

// @region namespaceDeclaration// @startlock
	var iconTellUsWhatYouThink = {};	// @icon
	var imageModelZoom = {};	// @image
	var button5 = {};	// @button
	var button4 = {};	// @button
	var dataGridEmployeeStaff = {};	// @dataGrid
	var dataGridCountryCompanies = {};	// @dataGrid
	var dataGridCompanyEmployees = {};	// @dataGrid
	var dataGridEmployee = {};	// @dataGrid
	var dataGridCountry = {};	// @dataGrid
	var dataGridCompany = {};	// @dataGrid
	var imageModelBig = {};	// @image
	var containerModelBig = {};	// @container
	var imageModelSmall = {};	// @image
	var iconLearnMore = {};	// @icon
	var examplesListEvent = {};	// @dataSource
	var buttonRunSSJS = {};	// @image
	var dataGridExamples = {};	// @dataGrid
// @endregion// @endlock

    var
        // constants
        ISO_DATE_REGEXP,
        CLIENT_TIMEOUT,
        KEEP_IN_TOUCH_URL,
        LEARN_MORE_URL,
        // sources
        localSources,
        sourceStatusText,
        sourceCountryLocation,
        sourceGoogleMapCountry,
        // widgets
        widgets,
        tabViewResults,
        menuItemGraphicView,
        menuItemJsonView,
        currentGraphicView,
        richTextStatusText,
        widgetButtonRunSSJS,
        richTextScalarResult,
        errorDivServerException,
        calendarDateResult,
        googleMapCountry,
        // ACE objects
        ssjsEditor,
        jsonView,
        // jQuery objects
        $richTextScalarResult,
        // other
        isISODate,
        scalarResultHandler;

    function prettifyJSON(json, indent) {
		indent = indent || 4;
		return JSON.stringify(JSON.parse(json), null, indent);
	}
	
	function toPrettyJSON(value, indent) {
		indent = indent || 4;
		return JSON.stringify(value, null, indent);
	}

	function setCode(jsCode) {
        ssjsEditor.setValue(jsCode, 0);
		ssjsEditor.clearSelection();
		ssjsEditor.focus();	
	}
	
	function showJsonResult(jsonResult) {
		if (sourceStatusText) {
            sourceStatusText.sync();
        }
        jsonView.setValue(jsonResult, 0);
		jsonView.clearSelection();
		jsonView.navigateTo(0, 0);
		ssjsEditor.focus();	
	}
	
	function updateRichTextAceSyntaxClass(type) {
		$richTextScalarResult.removeClass('ace_null ace_undefined ace_boolean ace_numeric ace_string');
		$richTextScalarResult.addClass('ace_' + type);
	}
	
	function prepareUndefinedResult(result) {
		statusText = 'The result is undefined';
		updateRichTextAceSyntaxClass('undefined');
		return result;
	}
	
	function prepareNullResult(result) {
		statusText = 'The result is null';
		updateRichTextAceSyntaxClass('null');
		return result;
	}
	
	function prepareBooleanResult(result) {
		statusText = 'The result is a boolean.';
		updateRichTextAceSyntaxClass('boolean');
		return result;
	}
	
	function prepareNumberResult(result) {
		statusText = 'The result is a number.';
		updateRichTextAceSyntaxClass('number');
		return result;
	}
	
	function prepareStringResult(result) {
	    statusText = 'The result is a string.';
	    updateRichTextAceSyntaxClass('string');
	    result = '"' + result.replace('"', '\"') + '"';
        return result;
	}
	
	function prepareDateResult(result) {
        statusText = 'The result is a Date object.';
	    result = new Date(Date.UTC(+isISODate[1], +isISODate[2] - 1, +isISODate[3], +isISODate[4], +isISODate[5], +isISODate[6]));
	    //richTextDateResult.setValue(result.getHours() + ':' + result.getMinutes())
		calendarDateResult.setValue(result);
		currentGraphicView = widgets.containerResultDate;
		return result;
	}
	
	function prepareStringOrDateResult(result) {
		isISODate = ISO_DATE_REGEXP.exec(result);
	    if (isISODate !== null) {
	    	// Date
	    	result = prepareDateResult(result);
	    } else {
	    	// String
	    	result = prepareStringResult(result);
		}
        return result;
	}
	
	function prepareFunctionResult(result) {
        statusText = 'Unexpected result';
		return result;
	}

    function selectTab(index) {
    	tabViewResults.selectTab(index);
    }

    // const
	ISO_DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
	CLIENT_TIMEOUT = 8000;
    KEEP_IN_TOUCH_URL = 'http://go.4d.com/wak-app-lead-form.html';
    LEARN_MORE_URL = 'http://www.wakanda.org/blog/wakanda-server-coding-hand';

    $('#containerDialogKeepInTouch > iframe').attr('src', KEEP_IN_TOUCH_URL + location.search);

    // First proposed Server-Side JavaScript Code
	jsCode = '// Discover WakandaDB with the proposed examples\n';
	jsCode += '\n';
	jsCode += '// Or write your own code using the server-side JS API\n';
	jsCode += '// Documentation: http://doc.wakanda.org/ssjs-query';
	
	scalarResultHandler = {
		'undefined': {prepare: prepareUndefinedResult},
		'object': {prepare: prepareNullResult},
		'boolean': {prepare: prepareBooleanResult},
		'number': {prepare: prepareNumberResult},
		'string': {prepare: prepareStringOrDateResult},
		'function': {prepare: prepareFunctionResult}
	};

	// default comment and valid country location
	statusText = 'Ready for server-side JavaScript execution';
	countryLocation = 'USA';

	examplesList = [
        {icon: "", code: "ds.Employee.count()", tip:"Get the number of entities related to a dataclass"},
        {icon: "", code: "ds.Employee.all()", tip:"Get all the entities related to a dataclass"},
        {icon: "", code: "ds.Employee.query('age < :1', 25)", tip:"Get the employees who are older than 20"},
        {icon: "", code: "ds.Employee.query('age < :1', 20).length", tip:"Get the number of employees who are older than 20"},
        {icon: "", code: "ds.Employee.age"},
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
    
       // sources
	localSources = WAF.sources;
    sourceStatusText = WAF.sources.statusText;
	sourceStatusText.sync();
    sourceCountryLocation = WAF.sources.countryLocation;
	sourceCountryLocation.sync();
    sources.examplesList.sync();

    // widgets
	widgets = WAF.widgets;
	widgetButtonRunSSJS = widgets.buttonRunSSJS;
	richTextStatusText = widgets.richTextStatusText;
	tabViewResults = widgets.tabViewResults;
	menuItemGraphicView = widgets.menuItemGraphicView;
	menuItemJsonView = widgets.menuItemJsonView;
	currentGraphicView = widgets.dataGridEmployee;
	richTextScalarResult = widgets.richTextScalarResult;
	errorDivServerException = widgets.errorDivServerException;
	calendarDateResult = widgets.calendarDateResult;

    // jQuery objects
    $richTextScalarResult = richTextScalarResult.$domNode;

	menuItemGraphicView.disable();
    menuItemJsonView.disable(); 

	// ace objects accessible by components via WDB_ACADEMY namespace
	ssjsEditor = ace.edit(widgets.containerSsjsEditor.id);
	jsonView = ace.edit(widgets.containerJsonView.id);

    // Editor initialisation
	ssjsEditor.setTheme("ace/theme/github");
	ssjsEditor.getSession().setMode("ace/mode/javascript");
	ssjsEditor.commands.addCommand({
	    name: 'Run',
	    bindKey: {win: 'Shift-Return',  mac: 'Shift-Return'},
	    exec: buttonRunSSJS.click
	});
	 	    
    // JSON View initialisation
	jsonView.setTheme("ace/theme/github");
	jsonView.getSession().setMode("ace/mode/json");
	jsonView.setReadOnly(true);
	
	setCode(jsCode);

	widgets.containerLoading.hide();


// eventHandlers// @lock

	iconTellUsWhatYouThink.click = function iconTellUsWhatYouThink_click (event)// @startlock
	{// @endlock
		widgets.dialogKeepInTouch.show();
	};// @lock

	imageModelZoom.click = function imageModelZoom_click (event)// @startlock
	{// @endlock
		widgets.containerCenteredPage.hide();
		widgets.containerModelBig.show();
	};// @lock

	button5.click = function button5_click (event)// @startlock
	{// @endlock
		// ok button
		widgets.dialogKeepInTouch.hide();
	};// @lock

	button4.click = function button4_click (event)// @startlock
	{// @endlock
		// cancel button
		widgets.dialogKeepInTouch.show();
	};// @lock

	dataGridEmployeeStaff.onRowDblClick = function dataGridEmployeeStaff_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Employee(' + this.source.ID + ')');
		buttonRunSSJS.click();
	};// @lock

	dataGridCountryCompanies.onRowDblClick = function dataGridCountryCompanies_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Company(' + this.source.ID + ')');
		buttonRunSSJS.click();
	};// @lock

	dataGridCompanyEmployees.onRowDblClick = function dataGridCompanyEmployees_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Employee(' + this.source.ID + ')');
		buttonRunSSJS.click();
	};// @lock

	dataGridEmployee.onRowDblClick = function dataGridEmployee_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Employee(' + this.source.ID + ')');
		buttonRunSSJS.click();
	};// @lock

	dataGridCountry.onRowDblClick = function dataGridCountry_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Country(' + this.source.ID + ')');
		buttonRunSSJS.click();
	};// @lock

	dataGridCompany.onRowDblClick = function dataGridCompany_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Company(' + this.source.ID + ')');
		buttonRunSSJS.click();
	};// @lock

	imageModelBig.click = function imageModelBig_click (event)// @startlock
	{// @endlock
		widgets.containerCenteredPage.show();
		widgets.containerModelBig.hide();
	};// @lock

	containerModelBig.click = function containerModelBig_click (event)// @startlock
	{// @endlock
		widgets.containerCenteredPage.show();
		widgets.containerModelBig.hide();
	};// @lock

	imageModelSmall.click = function imageModelSmall_click (event)// @startlock
	{// @endlock
		widgets.containerModelBig.show();
		widgets.containerCenteredPage.hide();
	};// @lock

	iconLearnMore.click = function iconLearnMore_click (event)// @startlock
	{// @endlock
		location = LEARN_MORE_URL + location.search;
	};// @lock

	examplesListEvent.onCurrentElementChange = function examplesListEvent_onCurrentElementChange (event)// @startlock
	{// @endlock
		//setCode(this.code);
	};// @lock

	buttonRunSSJS.click = function buttonRunSSJS_click (event)// @startlock
	{// @endlock
		var
            runningMethod,
            timer,
            result,
            originalLength;

        //event.preventDefault();
        
        //widgetButtonRunSSJS.disable();
        statusText = 'Executing JavaScript on the server...';
		sourceStatusText.sync();
		jsonView.setValue('');
		currentGraphicView.hide();

        menuItemJsonView.enable();
        if (tabViewResults.getSelectedTab().index === 1) {
        	// tab JSON view
            tabViewResults.selectTab(2);
        }

		runningMethod = ds.Proxy.callMethod({
			method: 'runOnServer',
			onSuccess: function handleSsjsSuccess(response) {
				var
				    rawResult,
				    result,
				    resultType,
				    xhr,
				    originalLength,
				    isISODate,
				    dataclass,
				    collection,
				    source;

				//debugger;
				clearTimeout(timer);
				statusText = 'Analizing the server result...';
                sourceStatusText.sync();
                richTextStatusText.setTextColor('black');

				isISODate = null;
			    xhr = response.XHR;

				//debugger;
				rawResult = xhr.getResponseHeader('X-JSON-Unsupported-JS-Value');
				originalLength = xhr.getResponseHeader('X-Original-Array-Length');

				if (originalLength) {
					result = result.HTTPStream;
					rawResult = result;
				} else if (['NaN', 'undefined', 'Infinity', '-Infinity'].indexOf(rawResult) > -1) {
					result = rawResult;
					rawResult = eval(rawResult); // eval() only used if rawResult is NaN, Infinity, or undefined
				} else {
				    rawResult = JSON.parse(xhr.responseText);
    				rawResult = ((typeof rawResult === 'object') && rawResult && rawResult.hasOwnProperty('result')) ? rawResult.result : rawResult;
    				result = response.result;
				}
				
				resultType = typeof result;

				if (result === null || resultType !== 'object') {
					
					currentGraphicView = widgets.richTextScalarResult;
					// Handle scalar, null and Date values
					result = scalarResultHandler[resultType].prepare(result);
					
					if (isISODate === null) {
						currentGraphicView.setValue(String(result));
					}
					
					currentGraphicView.show();
					menuItemGraphicView.enable();
			    	
			    } else if (result.hasOwnProperty('undefined') && result['undefined'] === 'undefined') {
					
					// Result is undefined

					statusText = 'The result is undefined.';
					currentGraphicView.addClass('ace_undefined');
					result = 'undefined';
					rawResult = result;

				} else if (result instanceof WAF.EntityCollection) {

					// Result is an EntityCollection

					dataclass = result.getDataClass().getName();
					source = localSources[dataclass.toLowerCase()];

					statusText = 'The result is an ' + dataclass + ' Entity Collection. ';

					if (rawResult.__COUNT > rawResult.__SENT) {
						statusText += "Showing " + rawResult.__SENT + " first entities from the " + rawResult.__COUNT + " found.";
					} else {
						statusText += "\nShowing the " + rawResult.__COUNT + " found entities.";
					}

					collection = ds[dataclass].newCollection();
					source.setEntityCollection(collection);

                    // show the widget
			    	currentGraphicView = widgets['dataGrid' + dataclass];
					currentGraphicView.show();
					
					source.setEntityCollection(response.result);

                    currentGraphicView.onResize();
					menuItemGraphicView.enable();

			    } else if (result instanceof WAF.Entity) {

					// Result is an Entity

			    	dataclass = result.getDataClass().getName();
			    	source = localSources[dataclass.toLowerCase()];

					statusText = 'The result is an ' + dataclass + ' Entity.';
			    	
			    	collection = ds[dataclass].newCollection();
				    collection.add(response.result);
				    source.setEntityCollection(collection);

					if (dataclass === 'Country') {
						countryLocation = result.name.getValue();
						sourceCountryLocation.sync();
				    } else if (dataclass === 'Company') {
						countryLocation = result.countryName.getValue();
						sourceCountryLocation.sync();
				    }

					currentGraphicView = widgets['container' + dataclass];
				    currentGraphicView.show();
					menuItemGraphicView.enable();
					
					var relatedDataGrids = {
						Employee: 'dataGridEmployeeStaff',
						Company: 'dataGridCompanyEmployees',
						Country: 'dataGridCountryCompanies'
					};
					widgets[relatedDataGrids[dataclass]].onResize();

				} else if (result instanceof Array) {
					
					// Result is an Array
					
					//originalLength = xhr.getResponseHeader('X-Original-Array-Length') || result.length;

					statusText = 'The result is an Array. ';
					
					/*
					if (originalLength > 40) {
						statusText += "Showing the 40 first elements from the " + originalLength + " found.";
					} else {
						statusText += "Showing the " + originalLength + " found elements.";
					}
					*/

		            // No Graphic view, force JSON view
		            selectTab(3);
		            menuItemGraphicView.disable();

				} else {

					// Result is another object type

					statusText = 'The result is an Object.';

					// No Graphic view, force JSON view
		            selectTab(3); 
		            menuItemGraphicView.disable();
					
				}
				
                // show JSON result
                showJsonResult(toPrettyJSON(rawResult));
                widgetButtonRunSSJS.enable();
			},

			onError: function handleSsjsError(response) {

				var
				    xhr,
				    error,
				    originalContentType,
				    mainErrorMessage,
				    jsonResult;

				//debugger;
				clearTimeout(timer);
				jsonResult = '"no response received"';

				//debugger;
				statusText = 'Analizing the server result...';
                sourceStatusText.sync();

				// Binary Data are not yet natively supported by the dataprovider but can be handled via onError
				xhr = response.XHR;
				originalContentType = xhr.getResponseHeader('X-Original-Content-Type');

                if (xhr.status === 0) {
					statusText = 'Connection to the server failed... Please retry Later';
	                sourceStatusText.sync();
                } else switch (originalContentType) {

			    case null:

                    // An exception occured on the server

    				statusText = 'An Exception has been thrown on the server!';
                    richTextStatusText.setTextColor('red');
                    
			    	error = JSON.parse(xhr.responseText).__ERROR;
			    	mainErrorMessage = error[0].message;

			    	// show message in Display Error widget
					currentGraphicView = widgets.errorDivServerException;
					// setValue() doesn't work on the Display error widget
					// currentWidget.setValue(mainErrorMessage);
					currentGraphicView.$domNode.text(mainErrorMessage);
					currentGraphicView.show();
					menuItemGraphicView.enable();

			    	// Show the JSON result
					jsonResult = toPrettyJSON(error);
					break;

			    case 'application/json':

					// Result is an an unsupported JSON value or a too big Array

				    currentGraphicView = widgets.richTextScalarResult;
				    
				    jsonResult = xhr.getResponseHeader('X-Limited-Array-Value');
					if (jsonResult) {
						originalLength = xhr.getResponseHeader('X-Original-Array-Length') || result.length;
						statusText = 'The result is an Array. ';
						
						if (originalLength > 40) {
							statusText += "Showing the 40 first elements from the " + originalLength + " found.";
						} else {
							statusText += "\nShowing the " + originalLength + " found elements.";
						}

			            // No Graphic view, force JSON view
			            selectTab(2);
			            menuItemGraphicView.disable();

					    jsonResult = toPrettyJSON(error);

				    } else {

				    	jsonResult = xhr.getResponseHeader('X-JSON-Unsupported-JS-Value');

				    	if (['NaN', 'undefined', 'Infinity', '-Infinity'].indexOf(jsonResult) === -1) {
				    		// unexpected value
							statusText = 'The result is in an unknown format.';
		                    richTextStatusText.setTextColor('red');
		                    jsonResult = '';
						} else if (jsonResult === 'undefined') {
							// undefined
					        statusText = 'The result is "undefined".';
					    } else {
					        // NaN, Infinity, or -Infinity
					        statusText = 'The result is a number.';
					    }

				    }

					// update the graphic view
					currentGraphicView.setValue(jsonResult);
					currentGraphicView.show();
					menuItemGraphicView.enable();
					break;

			    case 'image/jpeg':

					// Result is an Image
    				statusText = 'The result is an Image.';
					
					// show the image
					currentGraphicView = widgets.imageResult;
					currentGraphicView.setValue('data:image/jpeg;base64,' + encode64(xhr.responseText));
					currentGraphicView.show();
					menuItemGraphicView.enable();

					// Show the JSON Result
					jsonResult = prettifyJSON(xhr.getResponseHeader('X-Image-Data'));
					break;

				default:

					// Result is in an unknown format
	    				statusText = 'The result is in an unknown format.';
	                    richTextStatusText.setTextColor('red');

                    // No Graphic view, force JSON view
		            selectTab(2); 
		            menuItemGraphicView.disable();

			    }
			    
                // show JSON result
                showJsonResult(jsonResult);
                widgetButtonRunSSJS.enable();
			}
		}, ssjsEditor.getValue());
		
		timer = setTimeout(function requestTimoutExpired() {

            // Response Timeout expired
    		statusText = 'Response Timeout expired.';
    		widgetButtonRunSSJS.enable();
    		//debugger;
			//runningMethod.xhr.abort();

            richTextStatusText.setTextColor('red');
                    
			result = 'Request aborted';
			showJsonResult(result);

			// show message in Display Error widget
			currentGraphicView = widgets.errorDivServerException;
			// setValue() doesn't work on the Display error widget
			// currentWidget.setValue(mainErrorMessage);
			currentGraphicView.$domNode.text(result);
			currentGraphicView.show();
			menuItemGraphicView.enable();

		}, CLIENT_TIMEOUT);
	};// @lock

	dataGridExamples.onRowDraw = function dataGridExamples_onRowDraw (event)// @startlock
	{// @endlock
		// Add your code here
	};// @lock

	dataGridExamples.onRowDblClick = function dataGridExamples_onRowDblClick (event)// @startlock
	{// @endlock
        buttonRunSSJS.click();
	};// @lock

	dataGridExamples.onRowClick = function dataGridExamples_onRowClick (event)// @startlock
	{// @endlock
		if (!widgetButtonRunSSJS.enabled) {
			setCode(this.source.code);
		} else {
			alert('A request is currently running. Please wait until the result is received');
		}
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("iconTellUsWhatYouThink", "click", iconTellUsWhatYouThink.click, "WAF");
	WAF.addListener("imageModelZoom", "click", imageModelZoom.click, "WAF");
	WAF.addListener("button5", "click", button5.click, "WAF");
	WAF.addListener("button4", "click", button4.click, "WAF");
	WAF.addListener("dataGridEmployeeStaff", "onRowDblClick", dataGridEmployeeStaff.onRowDblClick, "WAF");
	WAF.addListener("dataGridCountryCompanies", "onRowDblClick", dataGridCountryCompanies.onRowDblClick, "WAF");
	WAF.addListener("dataGridCompanyEmployees", "onRowDblClick", dataGridCompanyEmployees.onRowDblClick, "WAF");
	WAF.addListener("dataGridEmployee", "onRowDblClick", dataGridEmployee.onRowDblClick, "WAF");
	WAF.addListener("dataGridCountry", "onRowDblClick", dataGridCountry.onRowDblClick, "WAF");
	WAF.addListener("dataGridCompany", "onRowDblClick", dataGridCompany.onRowDblClick, "WAF");
	WAF.addListener("imageModelBig", "click", imageModelBig.click, "WAF");
	WAF.addListener("containerModelBig", "click", containerModelBig.click, "WAF");
	WAF.addListener("imageModelSmall", "click", imageModelSmall.click, "WAF");
	WAF.addListener("iconLearnMore", "click", iconLearnMore.click, "WAF");
	WAF.addListener("dataGridExamples", "onRowDraw", dataGridExamples.onRowDraw, "WAF");
	WAF.addListener("examplesList", "onCurrentElementChange", examplesListEvent.onCurrentElementChange, "WAF");
	WAF.addListener("buttonRunSSJS", "click", buttonRunSSJS.click, "WAF");
	WAF.addListener("dataGridExamples", "onRowDblClick", dataGridExamples.onRowDblClick, "WAF");
	WAF.addListener("dataGridExamples", "onRowClick", dataGridExamples.onRowClick, "WAF");
// @endregion
};// @endlock
