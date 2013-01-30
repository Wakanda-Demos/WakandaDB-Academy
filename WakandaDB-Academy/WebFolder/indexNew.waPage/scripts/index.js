
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var examplesListEvent = {};	// @dataSource
	var buttonRunSSJS = {};	// @image
	var dataGridExamples = {};	// @dataGrid
// @endregion// @endlock

    var
        ISO_DATE_REGEXP,
        CLIENT_TIMEOUT,
        // sources
        localSources,
        sourceJsonComment,
        sourceCountryLocation,
        // widgets
        widgets,
        widgetButtonRunSSJS,
        ssjsEditor,
        jsonView;

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
	    	result = prepareDateResult(result)
	    } else {
	    	// String
	    	result = prepareStringResult(result)
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
	CLIENT_TIMEOUT = 30000;

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
	jsonComment = 'Ready for server-side JavaScript ecxecution';
	countryLocation = 'USA';

	examplesList = [
        {icon: "", code: "ds.Employee.all()"},
        {icon: "", code: "ds.Employee.first()"},
        {icon: "", code: "ds.Employee.first().company"},
        {icon: "", code: "ds.Employee.first().company.country"},
        {icon: "", code: "ds.Employee.first().company.manager"},
        {icon: "", code: "ds.Company.query('country.name = :1', 'Japan')"},
        {icon: "", code: "ds.Company(3).employees"}
    ];
    
       // sources
	localSources = WAF.sources;
    sourceJsonComment = WAF.sources.jsonComment;
	sourceJsonComment.sync();
    sourceCountryLocation = WAF.sources.countryLocation;
	sourceCountryLocation.sync();
    sources.examplesList.sync();

    // widgets
	widgets = WAF.widgets;
	widgetButtonRunSSJS = widgets.buttonRunSSJS;
	richTextJsonComment = widgets.richTextJsonComment;
	tabViewResults = widgets.tabViewResults;
	menuItemGraphicView = widgets.menuItemGraphicView;
	menuItemJsonView = widgets.menuItemJsonView;
	currentGraphicView = widgets.dataGridEmployee;
	richTextScalarResult = widgets.richTextScalarResult;
	errorDivServerException = widgets.errorDivServerException;
	calendarDateResult = widgets.calendarDateResult;

	menuItemGraphicView.disable();
    menuItemJsonView.disable(); 

	// ace objects accessible by components via WDB_ACADEMY namespace
	ssjsEditor = ace.edit(widgets.containerSsjsEditor.id);
	jsonView = ace.edit(widgets.containerJsonView.id);

    // Editor initialisation
	ssjsEditor.setTheme("ace/theme/github");
	ssjsEditor.getSession().setMode("ace/mode/javascript");
	ssjsEditor.commands.addCommand({
	    name: 'myCommand',
	    bindKey: {win: 'Shift-Enter',  mac: 'Shift-Enter'},
	    exec: buttonRunSSJS.click
	});
	 	    
    // JSON View initialisation
	jsonView.setTheme("ace/theme/github");
	jsonView.getSession().setMode("ace/mode/json");
	jsonView.setReadOnly(true);


// eventHandlers// @lock

	examplesListEvent.onCurrentElementChange = function examplesListEvent_onCurrentElementChange (event)// @startlock
	{// @endlock
		ssjsEditor.setValue(this.code);
	};// @lock

	buttonRunSSJS.click = function buttonRunSSJS_click (event)// @startlock
	{// @endlock
		var
            runningMethod,
            timer;

        jsonComment = 'Executing JavaScript on the server...';
		sourceJsonComment.sync()
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
				jsonComment = 'Analizing the server result...';
                sourceJsonComment.sync();
                richTextJsonComment.setTextColor('black');

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
                widgetButtonRunSSJS.enable();
			}
		}, ssjsEditor.getValue());
		
		timer = setTimeout(function requestTimoutExpired() {

            // Response Timeout expired
    		jsonComment = 'Response Timeout expired.';
    		widgetButtonRunSSJS.enable();
    		//debugger;
			//runningMethod.xhr.abort();

            richTextJsonComment.setTextColor('red');
                    
			jsonResult = 'Request aborted';
			showJsonResult(jsonResult);

			// show message in Display Error widget
			currentGraphicView = widgets.errorDivServerException;
			// setValue() doesn't work on the Display error widget
			// currentWidget.setValue(mainErrorMessage);
			currentGraphicView.$domNode.text(jsonResult);
			currentGraphicView.show();
			menuItemGraphicView.enable();

		}, CLIENT_TIMEOUT);
	};// @lock

	dataGridExamples.onCellClick = function dataGridExamples_onCellClick (event)// @startlock
	{// @endlock
		//console.log('ok', event, this);
	};// @lock

	dataGridExamples.onRowDblClick = function dataGridExamples_onRowDblClick (event)// @startlock
	{// @endlock
		//console.log('ok', event, this);
		ssjsEditor.setValue(this.source.code);
		buttonRunSSJS.click();
	};// @lock

	dataGridExamples.onRowClick = function dataGridExamples_onRowClick (event)// @startlock
	{// @endlock
		//console.log('ok', event, this);
		ssjsEditor.setValue(this.source.code);
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("dataGridExamples", "onCellClick", dataGridExamples.onCellClick, "WAF");
	WAF.addListener("examplesList", "onCurrentElementChange", examplesListEvent.onCurrentElementChange, "WAF");
	WAF.addListener("buttonRunSSJS", "click", buttonRunSSJS.click, "WAF");
	WAF.addListener("dataGridExamples", "onRowDblClick", dataGridExamples.onRowDblClick, "WAF");
	WAF.addListener("dataGridExamples", "onRowClick", dataGridExamples.onRowClick, "WAF");
// @endregion
};// @endlock
