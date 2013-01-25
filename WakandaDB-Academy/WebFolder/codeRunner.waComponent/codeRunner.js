
(function Component (id) {// @lock

"use strict";

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'codeRunner';
	// @endregion// @endlock

	var
		jsCode,
		scalarResultHandler,
		isISODate,
        // sources
        globalSources,
        localSources,
        sourceJsonComment,
        sourceGoogleMapCountry,
        // widgets
        widgets,
        richTextJsonComment,
        tabViewResults,
        menuItemGraphicView,
        menuItemJsonView,
        currentGraphicView,
        richTextScalarResult,
        calendarDateResult,
        errorDivServerException,
        // jQuery Node widget reference
        $richTextScalarResult,
        // ace
        ssjsEditor,
        jsonView,
        // const
		ISO_DATE_REGEXP;

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
		if (sourceJsonComment) {
            sourceJsonComment.sync();
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
		jsonComment = 'The result is undefined';
		updateRichTextAceSyntaxClass('undefined');
		return result;
	}
	
	function prepareNullResult(result) {
		jsonComment = 'The result is null';
		updateRichTextAceSyntaxClass('null');
		return result;
	}
	
	function prepareBooleanResult(result) {
		jsonComment = 'The result is a boolean.';
		updateRichTextAceSyntaxClass('boolean');
		return result;
	}
	
	function prepareNumberResult(result) {
		jsonComment = 'The result is a number.';
		updateRichTextAceSyntaxClass('number');
		return result;
	}
	
	function prepareStringOrDateResult(result) {
		isISODate = ISO_DATE_REGEXP.exec(result);
	    if (isISODate !== null) {
	    	// Date
	    	result = showDateResult(result)
	    } else {
	    	// String
	    	result = showStringResult(result)
		}
        return result;
	}
	
	function prepareStringResult(result) {
	    jsonComment = 'The result is a string.';
	    updateRichTextAceSyntaxClass('string');
	    result = '"' + result.replace('"', '\"') + '"';
        return result;
	}
	
	function prepareDateResult(result) {
        jsonComment = 'The result is a Date object.';
	    result = new Date(Date.UTC(+isISODate[1], +isISODate[2] - 1, +isISODate[3], +isISODate[4], +isISODate[5], +isISODate[6]));
	    //richTextDateResult.setValue(result.getHours() + ':' + result.getMinutes())
		calendarDateResult.setValue(result);
		currentGraphicView = widgets.containerResultDate;
		return result;
	}
	
	function prepareFunctionResult(result) {
        jsonComment = 'Unexpected result';
		return result;
	}

    function selectTab(index) {
    	tabViewResults.selectTab(index);
    }

    // const
	ISO_DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;

    // First proposed Server-Side JavaScript Code
	jsCode = '';
	
	scalarResultHandler = {
		'undefined': {prepare: prepareUndefinedResult},
		'object': {prepare: prepareNullResult},
		'boolean': {prepare: prepareBooleanResult},
		'number': {prepare: prepareNumberResult},
		'string': {prepare: prepareStringOrDateResult},
		'function': {prepare: prepareFunctionResult}
	}

	// default comment and valid country location
	jsonComment = 'Ready for Server-Side JavaScript execution';
	googleMapCountry = 'USA';

    // sources
	globalSources = WAF.sources;
	localSources = this.sources;
    sourceJsonComment = globalSources.jsonComment;
	sourceJsonComment.sync();
    sourceGoogleMapCountry = globalSources.googleMapCountry;
	sourceGoogleMapCountry.sync();

    // widgets
	widgets = this.widgets;
	richTextJsonComment = widgets.richTextJsonComment;
	tabViewResults = widgets.tabViewResults;
	menuItemGraphicView = widgets.menuItemGraphicView;
	menuItemJsonView = widgets.menuItemJsonView;
	currentGraphicView = widgets.dataGridEmployee;
	richTextScalarResult = widgets.richTextScalarResult;
	errorDivServerException = widgets.errorDivServerException;
	calendarDateResult = widgets.calendarDateResult;
	tabViewResults = widgets.tabViewResults;
	menuItemGraphicView = widgets.menuItemGraphicView;
	menuItemJsonView = widgets.menuItemJsonView;
	
	$richTextScalarResult = richTextScalarResult.$domNode;

	// ace objects accessible by components via WDB_ACADEMY namespace
	ssjsEditor = ace.edit(widgets.containerSsjsEditor.id);
	jsonView = ace.edit(widgets.containerJsonView.id);
	
	// provide a method to publish JS Code in this component
	WDB_ACADEMY.setCode = setCode;
	WDB_ACADEMY.selectTab = selectTab;

// eventHandlers

	this.load = function (data) {// @lock

	// @region namespaceDeclaration// @startlock
	var dataGridEmployee = {};	// @dataGrid
	var dataGridCompany = {};	// @dataGrid
	var dataGridCountry = {};	// @dataGrid
	var dataGridEmployeeStaff = {};	// @dataGrid
	var dataGridCompanyEmployees = {};	// @dataGrid
	var dataGridCountryCompanies = {};	// @dataGrid
	var buttonRunSSJS = {};	// @button
	// @endregion// @endlock
   
    // Initialization
    menuItemGraphicView.disable();
    menuItemJsonView.disable();    

    // Editor initialisation
	ssjsEditor.setTheme("ace/theme/github");
	ssjsEditor.getSession().setMode("ace/mode/javascript");
	ssjsEditor.commands.addCommand({
	    name: 'myCommand',
	    bindKey: {win: 'Ctrl-/',  mac: 'Command-/'},
	    exec: buttonRunSSJS.click
	});
	setCode(jsCode);
	 	    
    // JSON View initialisation
	jsonView.setTheme("ace/theme/github");
	jsonView.getSession().setMode("ace/mode/json");
	jsonView.setReadOnly(true);

	// eventHandlers// @lock

	dataGridEmployee.onRowDblClick = function dataGridEmployee_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Employee(' + localSources.employee.ID + ');');
		buttonRunSSJS.click();
	};// @lock

	dataGridCompany.onRowDblClick = function dataGridCompany_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Company(' + localSources.company.ID + ');');
		buttonRunSSJS.click();
	};// @lock

	dataGridCountry.onRowDblClick = function dataGridCountry_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Country(' + localSources.country.ID + ');');
		buttonRunSSJS.click();
	};// @lock

	dataGridEmployeeStaff.onRowDblClick = function dataGridEmployeeStaff_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Company(' + localSources.employeeStaff.ID + ');');
		buttonRunSSJS.click();
	};// @lock

	dataGridCompanyEmployees.onRowDblClick = function dataGridCompanyEmployees_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Company(' + localSources.companyEmployees.ID + ');');
		buttonRunSSJS.click();
	};// @lock

	dataGridCountryCompanies.onRowDblClick = function dataGridCountryCompanies_onRowDblClick (event)// @startlock
	{// @endlock
		setCode('ds.Company(' + localSources.countryCompanies.ID + ');');
		buttonRunSSJS.click();
	};// @lock

	buttonRunSSJS.click = function buttonRunSSJS_click (event)// @startlock
	{// @endlock
        jsonComment = 'Executing JavaScript on the server...';
		sourceJsonComment.sync()
		showJsonResult('');
		currentGraphicView.hide();

		menuItemJsonView.enable();
        if (tabViewResults.getSelectedTab().index === 1) {
            selectTab(2);
        }
		
	    menuItemGraphicView.enable();
	
		ds.Proxy.callMethod({
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
				jsonComment = 'Analizing the server result...';
                sourceJsonComment.sync();
                richTextJsonComment.setTextColor('black');

				isISODate = null;
			    xhr = response.XHR;

				debugger;
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

					jsonComment = 'The result is undefined.';
					currentGraphicView.addClass('ace_undefined');
					result = 'undefined';
					rawResult = result;

				} else if (result instanceof WAF.EntityCollection) {

					// Result is an EntityCollection

					dataclass = result.getDataClass().getName();
					source = localSources[dataclass.toLowerCase()];

					jsonComment = 'The result is an ' + dataclass + ' Entity Collection. ';

					if (rawResult.__COUNT > rawResult.__SENT) {
						jsonComment += "Showing " + rawResult.__SENT + " first entities from the " + rawResult.__COUNT + " found.";
					} else {
						jsonComment += "Showing the " + rawResult.__COUNT + " found entities.";
					}

					//collection = ds[dataclass].newCollection();
					//source.setEntityCollection(collection);

                    // show the widget
			    	currentGraphicView = widgets['dataGrid' + dataclass];
					currentGraphicView.show();
					
					//setTimeout(function() {
						source.setEntityCollection(response.result);
					//}, 100);

                    currentGraphicView.onResize();
					menuItemGraphicView.enable();

			    } else if (result instanceof WAF.Entity) {

					// Result is an Entity

			    	dataclass = result.getDataClass().getName();
			    	source = localSources[dataclass.toLowerCase()];

					jsonComment = 'The result is an ' + dataclass + ' Entity.';
			    	
			    	collection = ds[dataclass].newCollection();
				    collection.add(response.result);
				    source.setEntityCollection(collection);

					if (dataclass === 'Country') {
						googleMapCountry = result.name.getValue();
						sourceGoogleMapCountry.sync();
				    } else if (dataclass === 'Company') {
						googleMapCountry = result.countryName.getValue();
						sourceGoogleMapCountry.sync();
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
					
					originalLength = xhr.getResponseHeader('X-Original-Array-Length') || result.length;

					jsonComment = 'The result is an Array. ';
					
					if (originalLength > 40) {
						jsonComment += "Showing the 40 first elements from the " + originalLength + " found.";
					} else {
						jsonComment += "Showing the " + originalLength + " found elements.";
					}

		            // No Graphic view, force JSON view
		            selectTab(2);
		            menuItemGraphicView.disable();

				} else {

					// Result is another object type

					jsonComment = 'The result is an Object.';

					// No Graphic view, force JSON view
		            selectTab(2); 
		            menuItemGraphicView.disable();
					
				}
				
                // show JSON result
                showJsonResult(toPrettyJSON(rawResult));
			},

			onError: function handleSsjsError(response) {

				var
				    xhr,
				    error,
				    originalContentType,
				    mainErrorMessage,
				    jsonResult;

				//debugger;
				jsonResult = '"no response received"';

				debugger;
				jsonComment = 'Analizing the server result...';
                sourceJsonComment.sync();

				// Binary Data are not yet natively supported by the dataprovider but can be handled via onError
				xhr = response.XHR;
				originalContentType = xhr.getResponseHeader('X-Original-Content-Type');

                if (xhr.status === 0) {
					jsonComment = 'Connection to the server failed... Please retry Later';
	                sourceJsonComment.sync();
                } else switch (originalContentType) {

			    case null:

                    // An exception occured on the server

    				jsonComment = 'An Exception has been thrown on the server!';
                    richTextJsonComment.setTextColor('red');
                    
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

					// Result is an an unsupported JSON value
					jsonResult = xhr.getResponseHeader('X-JSON-Unsupported-JS-Value');
					if (['NaN', 'undefined', 'Infinity', '-Infinity'].indexOf(jsonResult) === -1) {
						jsonComment = 'The result is in an unknown format.';
	                    richTextJsonComment.setTextColor('red');

	                    // No Graphic view, force JSON view
			            selectTab(2); 
			            menuItemGraphicView.disable();
						break;
					}

				    currentGraphicView = widgets.richTextScalarResult;

				    if (jsonResult === 'undefined') {
				        jsonComment = 'The result is "undefined".';
				    } else {
				        //jsonResult = Number(jsonResult);
				        jsonComment = 'The result is a number.';
				    }

					// show the result
					currentGraphicView.setValue(jsonResult);
					currentGraphicView.show();
					menuItemGraphicView.enable();
					break;

			    case 'image/jpeg':

					// Result is an Image
    				jsonComment = 'The result is an Image.';
					
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
    				jsonComment = 'The result is in an unknown format.';
                    richTextJsonComment.setTextColor('red');

                    // No Graphic view, force JSON view
		            selectTab(2); 
		            menuItemGraphicView.disable();

			    }
			    
                // show JSON result
                showJsonResult(jsonResult);
			}
		}, ssjsEditor.getValue());
		
			
	};// @lock



	// @region eventManager// @startlock
	WAF.addListener(this.id + "_dataGridEmployee", "onRowDblClick", dataGridEmployee.onRowDblClick, "WAF");
	WAF.addListener(this.id + "_dataGridCompany", "onRowDblClick", dataGridCompany.onRowDblClick, "WAF");
	WAF.addListener(this.id + "_dataGridCountry", "onRowDblClick", dataGridCountry.onRowDblClick, "WAF");
	WAF.addListener(this.id + "_dataGridCountryCompanies", "onRowDblClick", dataGridCountryCompanies.onRowDblClick, "WAF");
	WAF.addListener(this.id + "_dataGridCompanyEmployees", "onRowDblClick", dataGridCompanyEmployees.onRowDblClick, "WAF");
	WAF.addListener(this.id + "_dataGridEmployeeStaff", "onRowDblClick", dataGridEmployeeStaff.onRowDblClick, "WAF");
	WAF.addListener(this.id + "_buttonRunSSJS", "click", buttonRunSSJS.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
