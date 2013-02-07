/*jslint es5: true, nomen: true, todo: false, vars: true, white: true, browser: true, indent: 4 */

/*global WAF, ds, $, ace*/

var
    encode64,
    // local sources
    statusText, 
    countryLocation, 
    jsCode,
    examplesList;

WAF.onAfterInit = function onAfterInit() {// @lock

    "use strict";

// @region namespaceDeclaration// @startlock
	var documentEvent = {};	// @document
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
        PRODUCTION_MODE,
        CLIENT_TIMEOUT,
        CLIENT_TIMEOUT_DEV,
        ISO_DATE_REGEXP,
        QUERY_STRING,
        KEEP_IN_TOUCH_URL,
        LEARN_MORE_URL,
        POWERED_BY_WAKANDA_URL,
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
        currentRequestID,
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
    PRODUCTION_MODE = true;
    CLIENT_TIMEOUT = 7; // 7 sec
    CLIENT_TIMEOUT_DEV = 3600; // 1 hour 
    ISO_DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
    QUERY_STRING = window.location.search;
    KEEP_IN_TOUCH_URL = 'http://go.4d.com/wak-app-lead-form.html' + QUERY_STRING;
    LEARN_MORE_URL = 'http://www.wakanda.org/blog/wakanda-server-coding-hand' + QUERY_STRING;
    POWERED_BY_WAKANDA_URL = 'http://www.wakanda.org/features/server' + QUERY_STRING;

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
        {
            code: "ds.Employee.count()", 
            tip: "Get the number of entities related to a dataclass"
        },
        {
            code: "ds.Employee.all()", 
            tip: "Get all the entities related to a dataclass"
        },
        {
            code: "ds.Employee.query('age < :1', 25)", 
            tip: "Get the employees who are younger than 25 using a parametered query"
        },
        {
            code: "ds.Employee.query('age < :1', 25).length", 
            tip: "Get the number of employees who are younger than 25"
        },/*
        {
            code: "ds.Employee.age", 
            tip: "Get the description of the age employee attribute"
        },*/
        {
            code: "handler = guidedModel.Employee.age.onGet;\n// retrieved the age calculated attribute getter\n// split its source as array to make it readable\nhandler.toString().split('\\r\\n')", 
            tip: "Get the code of the age attribute getter"
        },
        {
            code: "ds.Employee.all()[0]",
            tip: "Get the first entity of a collection using the array index notation"
        },
        {
            code: "ds.Employee.all().first()",
            tip: "Get the first entity of a collection using the first() method"
        },
        {
            code: "ds.Employee.first()",
            tip: "Get the first entity of a dataclass stored in the datastore using the first() method"
        },
        {
            code: "ds.Employee.first().next()",
            tip: "Get the next entity from an entity while managing a list of entities"
        },
        {
            code: "ds.Employee(5)",
            tip: "Get an entity from its ID"
        },
        {
            code: "ds.Employee(5).company",
            tip: "Get a company related entitity from an employee."
        },
        {
            code: "ds.Employee(5).company.country",
            tip: "Get a country second level related entitity from an employee."
        },
        {
            code: "ds.Employee(5).company.countryName",
            tip: "Get the name of a company country using the countryName alias attribute"
        },
        {
            code: "ds.Employee(5).company.country.companies.length",
            tip: ""
        },
        {
            code: "ds.Employee(5).manager",
            tip: ""
        },
        {
            code: "ds.Employee(5).company.manager",
            tip: ""
        },
        {
            code: "ds.Company.query('country.name == :1', 'Japan')",
            tip: ""
        },
        {
            code: "ds.Company(3).employees",
            tip: ""
        },
        {
            code: "ds.Company.query('countryName == USA').compute('revenues')",
            tip: ""
        },
        {
            code: "ds.Country.find('name == Brazil')",
            tip: "Find a country entity from its name."
        },
        {
            code: "ds.Country.find('name == Brazil').companies",
            tip: "Find all the companies in Brazil"
        }
    ];
    
    // sources
    localSources = WAF.sources;
    // status
    sourceStatusText = localSources.statusText;
    sourceStatusText.sync();
    // country location
    sourceCountryLocation = localSources.countryLocation;
    sourceCountryLocation.sync();
    // examples
    localSources.examplesList.sync();

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

    // Tabs index constants
    tabViewResults.TAB_MODEL = 1;
    tabViewResults.TAB_GRAPHIC_VIEW = 2;
    tabViewResults.TAB_JSON_VIEW = 3;
    
    // jQuery objects
    $richTextScalarResult = richTextScalarResult.$domNode;

    menuItemGraphicView.disable();
    menuItemJsonView.disable(); 

    // ace objects accessible by components via WDB_ACADEMY namespace
    ssjsEditor = ace.edit(widgets.containerSsjsEditor.id);
    jsonView = ace.edit(widgets.containerJsonView.id);

    // URLs initialisation
    $('#containerDialogKeepInTouch > iframe').attr('src', KEEP_IN_TOUCH_URL);
    $('#imagePoweredByWakanda > img').attr('src', POWERED_BY_WAKANDA_URL);

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

    widgets.containerLoading.hide();

    setCode(jsCode);

    widgets.dataGridExamples.$domNode.delegate(
        '.waf-datagrid-row-inside',
        'mouseover',
        function showTipOnMouseOver(event) {
            codeTip = event.target.parentElement.nextElementSibling.firstChild.innerHTML;
            if (codeTip !== '&nbsp;') {
                sources.codeTip.sync();
                widgets.containerCodeTip.show();
                widgets.containerCodeTip.move(event.pageX - 300, event.pageY - 120);
            } else {
                widgets.containerCodeTip.hide();
            }
        }
    );

    widgets.dataGridExamples.$domNode.delegate(
        '.waf-datagrid-row-inside',
        'mouseout',
        function showTipOnMouseOver(event) {
            widgets.containerCodeTip.hide();
        }
    );

    widgets.dataGridExamples.$domNode.delegate(
        '.waf-datagrid-row-inside',
        'mousemove',
        function showTipOnMouseOver(event) {
            widgets.containerCodeTip.move(event.pageX - 300, event.pageY - 120);
        }
    );

// eventHandlers// @lock

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock
		$('#calendarDateResult').css({
			width: '180px',
			height: '150px'
		});

	};// @lock

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
        window.location = LEARN_MORE_URL;
	};// @lock

	examplesListEvent.onCurrentElementChange = function examplesListEvent_onCurrentElementChange (event)// @startlock
	{// @endlock
        //setCode(this.code);
	};// @lock

	buttonRunSSJS.click = function buttonRunSSJS_click (event)// @startlock
	{// @endlock
        var
            runningMethod,
            currentRequestID,
            remainingTime,
            timer,
            result,
            originalLength;

        widgetButtonRunSSJS.disable();
        richTextStatusText.setTextColor('black');
        statusText = 'Executing JavaScript on the server...';
        sourceStatusText.sync();
        jsonView.setValue('');
        currentGraphicView.hide();

        menuItemJsonView.enable();
        if (tabViewResults.getSelectedTab().index === tabViewResults.TAB_MODEL) {
            // tab JSON view
            selectTab(tabViewResults.TAB_GRAPHIC_VIEW);
        }

        currentRequestID = String(Date.now());
        runningMethod = ds.Proxy.callMethod({
            method: 'runOnServer',
            onSuccess: function handleSsjsSuccess(response) {
                var
                    rawResult,
                    result,
                    resultType,
                    xhr,
                    requestID,
                    originalLength,
                    isISODate,
                    dataclass,
                    collection,
                    source;

                //debugger;
                clearInterval(timer);
                statusText = 'Analizing the server result...';
                sourceStatusText.sync();

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
                        statusText += "\nShowing the " + originalLength + " found elements.";
                    }
                    */

                    // No Graphic view, force JSON view
                    selectTab(tabViewResults.TAB_JSON_VIEW);
                    menuItemGraphicView.disable();

                } else {

                    // Result is another object type

                    statusText = 'The result is an Object.';

                    // No Graphic view, force JSON view
                    selectTab(tabViewResults.TAB_JSON_VIEW); 
                    menuItemGraphicView.disable();
                    
                }
                
                // show JSON result
                showJsonResult(toPrettyJSON(rawResult));
                widgetButtonRunSSJS.enable();
                // force refresh button state
                $('#buttonRunSSJS').trigger('mouseout');
            },

            onError: function handleSsjsError(response) {

                var
                    xhr,
                    error,
                    requestID,
                    statusCode,
                    contentType,
                    originalContentType,
                    mainErrorMessage,
                    jsonResult;

                //debugger;
                clearInterval(timer);

                // Binary Data are not yet natively supported by the dataprovider but can be handled via onError
                xhr = response.XHR;

                requestID =  xhr.getResponseHeader('X-Request-ID');
                if (requestID && (requestID !== currentRequestID)) {
                    // unexpected or outdated request
                    return;
                }
                
                jsonResult = '"no response received"';

                //debugger;
                statusText = 'Analizing the server result...';
                sourceStatusText.sync();

                originalContentType = xhr.getResponseHeader('X-Original-Content-Type');

                if (xhr.status === 0) {
                    statusText = 'Connection to the server failed... Please retry Later';
                    sourceStatusText.sync();
                } else switch (originalContentType) {

                case null:

                    // An exception occured on the server

                    statusText = 'There was a ' + xhr.status + ' error (' + xhr.statusText + ') during the request';
                    richTextStatusText.setTextColor('red');

                    contentType = xhr.getResponseHeader('Content-Type');
                    if (contentType === 'application/json') {
                        error = JSON.parse(xhr.responseText);
                        if (error.__ERROR) {
                            statusText = 'An Exception has been thrown on the server!';
                            error = error.__ERROR;
                            mainErrorMessage = error[0].message;
                            // show message in Display Error widget
                            currentGraphicView = widgets.errorDivServerException;
                            // setValue() doesn't work on the Display error widget
                            // currentWidget.setValue(mainErrorMessage);
                            currentGraphicView.$domNode.text(mainErrorMessage);
                            currentGraphicView.show();
                            menuItemGraphicView.enable();
                        } else {
                            selectTab(tabViewResults.TAB_JSON_VIEW);
                            menuItemGraphicView.disable();
                        }
                    } else {
                        error = xhr.responseText;
                        selectTab(tabViewResults.TAB_JSON_VIEW);
                        menuItemGraphicView.disable();
                    }


                    // Show the JSON result
                    jsonResult = toPrettyJSON(error);
                    break;

                case 'application/json':

                    // Result is an an unsupported JSON value or a too big Array

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
                        selectTab(tabViewResults.TAB_JSON_VIEW);
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

                        // update the graphic view
                        currentGraphicView = widgets.richTextScalarResult;
                        currentGraphicView.setValue(jsonResult);
                        currentGraphicView.show();
                        menuItemGraphicView.enable();

                    }
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
                    selectTab(tabViewResults.TAB_JSON_VIEW); 
                    menuItemGraphicView.disable();

                }
                
                // show JSON result
                showJsonResult(jsonResult);
                widgetButtonRunSSJS.enable();
                // force refresh button state
                $('#buttonRunSSJS').trigger('mouseout');
            }
        }, ssjsEditor.getValue(), currentRequestID);

        remainingTime = PRODUCTION_MODE ? CLIENT_TIMEOUT : CLIENT_TIMEOUT_DEV;
        timer = setInterval(function requestTimoutExpired() {

            remainingTime -= 1;
            if (remainingTime > 0) {
                statusText = statusText.split('\n')[0] + '\n' + remainingTime + ' sec before timeout';
                sourceStatusText.sync();
                return;
            }

            // Response Timeout expired
            statusText = 'Response Timeout expired.';
            widgetButtonRunSSJS.enable();         
            // force refresh button state
            $('#buttonRunSSJS').trigger('mouseout');
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

        }, 1000);
	};// @lock

	dataGridExamples.onRowDraw = function dataGridExamples_onRowDraw (event)// @startlock
	{// @endlock
        // Add your code here
	};// @lock

	dataGridExamples.onRowDblClick = function dataGridExamples_onRowDblClick (event)// @startlock
	{// @endlock
        if (!widgetButtonRunSSJS.isDisabled()) {
            buttonRunSSJS.click();
        } else {
            window.alert('A request is currently running. Please wait until the result is received');
        }
        
	};// @lock

	dataGridExamples.onRowClick = function dataGridExamples_onRowClick (event)// @startlock
	{// @endlock
        if (!widgetButtonRunSSJS.isDisabled()) {
            setCode(this.source.code);
        } else {
            window.alert('A request is currently running. Please wait until the result is received');
        }
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
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
