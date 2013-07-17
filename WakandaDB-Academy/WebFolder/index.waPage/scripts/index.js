/*jslint es5: true, nomen: true, todo: false, vars: true, white: true, browser: true, indent: 4 */

/*global WAF, ds, $, ace*/

var
    // external function
    encode64,
    // local sources
    statusText, 
    countryLocation, 
    jsCode,
    examplesList;

WAF.onAfterInit = function onAfterInit() {

    "use strict";

// @region namespaceDeclaration
	var richTextStats = {};	// @richText
	var iconSubmitEmail = {};	// @icon
	var containerChart = {};	// @component
	var documentEvent = {};	// @document
	var iconTellUsWhatYouThink = {};	// @icon
	var imageModelZoom = {};	// @image
	var dataGridEmployeeStaff = {};	// @dataGrid
	var dataGridCountryCompanies = {};	// @dataGrid
	var dataGridCompanyEmployees = {};	// @dataGrid
	var dataGridEmployee = {};	// @dataGrid
	var dataGridCountry = {};	// @dataGrid
	var dataGridCompany = {};	// @dataGrid
	var imageModelBig = {};	// @image
	var containerModelBig = {};	// @container
	var imageModelSmall = {};	// @image
	var iconDownloadButton = {};	// @icon
	var examplesListEvent = {};	// @dataSource
	var buttonRunSSJS = {};	// @image
	var dataGridExamples = {};	// @dataGrid
// @endregion

    var
        // constants
        PRODUCTION_MODE = true,
        CLIENT_TIMEOUT = 7, // 7 sec
        CLIENT_TIMEOUT_DEV = 3600, // 1 mn
        ISO_DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/,
        QUERY_STRING = window.location.search,
        KEEP_IN_TOUCH_URL = 'http://go.4d.com/wak-app-lead-form.html' + QUERY_STRING,
        DOWNLOAD_URL = 'http://go.4d.com/WakandaDB-Academy.html' + QUERY_STRING,
        POWERED_BY_WAKANDA_URL = 'http://www.wakanda.org/features/server' + QUERY_STRING,
        // sources
        localSources,
        sourceStatusText,
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
        // ACE objects
        ssjsEditor,
        jsonView,
        // jQuery objects
        $richTextScalarResult,
        // other
        currentRequestID,
        isISODate,
        scalarResultHandler,
        currentCode,
        currentCodeTip,
        editorSatus;

    function prettifyJSON(json, indent) {
        indent = indent || 4;
        return JSON.stringify(JSON.parse(json), null, indent);
    }
    
    function toPrettyJSON(value, indent) {
        indent = indent || 4;
        return JSON.stringify(value, null, indent);
    }

    function setCode(jsCode, options) {
        options = options || {};
        ssjsEditor.setValue(jsCode, 0);
        if (options.selection) {
        	ssjsEditor.setSelection(options.selection);
        } else {
            ssjsEditor.clearSelection();
        }
        if (options.position) {
        	ssjsEditor.navigateTo(options.position.line, options.position.column);
        }
        if (options.focus !== false) {
            ssjsEditor.focus();
        }
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
    
    function prepareDateResult(isISODate) {
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
            result = prepareDateResult(isISODate);
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
    
    function getEditorSatus(editor) {
    	return {
    	    cursor: editor.getCursorPosition(),
    	    selectionRange: getSelectionRange(),
    	    lineRange: editor.getLineRange(),
    	    range: editor.getRange(),
    	    selectionAnchor: editor.getSelectionAnchor(),
    	    selectionLead: editor.getSelectionLead()
    	};
    }

    function restoreEditorStatus(editor, editorStatus) {
    	editor.setCursorPosition(editorStatus.cursor);
    	//editor.setCursorPosition(editorStatus.cursor);
    }

    if (location.hash === '#techdays') {
    	WAF.widgets.imageAmazonPartner.hide();
    }

    if (navigator.onLine !== false) {
    	WAF.widgets.componentSocialShareButtons.loadComponent();
    	WAF.widgets.containerChart.loadComponent();
    }

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
            code: "<Custom Code>",
            tip: "Write your own custom code"
        },
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
        },
        {
            code: "handler = model.Employee.age.onGet;\n"
                + "// retrieved the age calculated attribute getter\n"
                + "// split its source as array to make it readable\n"
                + "handler.toString().split('\\r\\n')", 
            tip: "Get the code of for the age attribute getter"
        },*/
        {
            code: "ds.Employee.all()[0]",
            tip: "Get the first entity in a collection using the array index notation"
        },
        {
            code: "ds.Employee.all().first()",
            tip: "Get the first entity in a collection using the first() method"
        },
        {
            code: "ds.Employee.first()",
            tip: "Get the first entity from a dataclass stored in the datastore using the first() method"
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
            tip: "Get a company's related entity from an employee."
        },
        {
            code: "ds.Employee(5).company.country",
            tip: "Get a country's second level related entity from an employee."
        },
        {
            code: "ds.Employee(5).company.countryName",
            tip: "Get the name of a company's country using the countryName alias attribute"
        },
        {
            code: "ds.Employee(5).company.country.companies.length",
            tip: "Get the number of companies in the country of this employee's Company."
        },
        {
            code: "ds.Employee(5).manager",
            tip: "Easily get an employee's manager"
        },
        {
            code: "ds.Employee(5).company.manager",
            tip: "Easily get the manager of an employee's company"
        },
        {
            code: "ds.Company.query('country.name == :1', 'Japan')",
            tip: "Retrieve companies whose country name is Japan"
        },
        {
            code: "ds.Company.query('country.name == :1', 'Japan').manager",
            tip: "Retrieving managers of Japanese companies"
        },
        {
            code: "ds.Company(3).employees",
            tip: "Get all the employees of a specified company"
        },
        {
            code: "ds.Company.query('countryName == USA').compute('revenues')",
            tip: "Get basic stats (average, max, min, count) about US companies (note the use of the countryName alias attribute)"
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
    examplesList.forEach(
        function generateExampleListIds(example, index) {
            example.id = index;
        }
    );
    
    // sources
    localSources = WAF.sources;
    // status
    sourceStatusText = localSources.statusText;
    sourceStatusText.sync();
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
    $('#imagePoweredByWakanda > img').attr('src', POWERED_BY_WAKANDA_URL);

    // Editor initialisation
    ssjsEditor.setTheme("ace/theme/github");
    ssjsEditor.getSession().setMode("ace/mode/javascript");
    ssjsEditor.commands.addCommand({
        name: 'Run',
        bindKey: {win: 'Shift-Return',  mac: 'Shift-Return'},
        exec: buttonRunSSJS.click
    });
    ssjsEditor.getSession().on(
        'change',
        function onCodeChange() {
            //localSources.examplesList.select(0);
        }
    );
    editorSatus = {};
             
    // JSON View initialisation
    jsonView.setTheme("ace/theme/github");
    jsonView.getSession().setMode("ace/mode/json");
    jsonView.setReadOnly(true);

    $('.waf-textField').attr('readonly', 'true');
    $('#textFieldEmail').removeAttr('readonly');
    

    widgets.containerLoading.hide();

    setCode(jsCode);

    widgets.dataGridExamples.$domNode.delegate(
        '.waf-datagrid-row-inside',
        'mouseover',
        function showTipOnMouseOver(event) {
            var
                colCode,
                cellCode,
                colTip,
                cellTip,
                cellTipContent;

            // preview the code
            colCode = event.target;
            cellCode = colCode && colCode.firstChild;
            if (cellCode) {
                currentCode = ssjsEditor.getValue();
                //editorSatus
                setCode(cellCode.data, {focus:false});
            }
            // show the tip
            colTip = event.target.parentElement.nextElementSibling;
            cellTip = colTip && colTip.firstChild;
            if (cellTip) {
                cellTipContent = cellTip.innerHTML;
                if (cellTipContent !== '&nbsp;') {
                    codeTip = cellTipContent;
                    sources.codeTip.sync();
                    widgets.containerCodeTip.show();
                    widgets.containerCodeTip.move(event.pageX - 150, event.pageY - 55);
                } else {
                    // clear codeTip datasource as it might be displayed elsewhere
                    codeTip = '';
                    sources.codeTip.sync();
                    widgets.containerCodeTip.hide();
                }
            }
        }
    );

    widgets.dataGridExamples.$domNode.delegate(
        '.waf-datagrid-row-inside',
        'mouseout',
        function hideTipOnMouseOut(event) {
        	// restore current code
        	setCode(currentCode, editorSatus);
        	// TODO: should restore also cursor selection and position

        	// clear code tip
            codeTip = currentCodeTip;
            sources.codeTip.sync();
            widgets.containerCodeTip.hide();
        }
    );

    widgets.dataGridExamples.$domNode.delegate(
        '.waf-datagrid-row-inside',
        'mousemove',
        function showTipOnMouseOver(event) {
            widgets.containerCodeTip.move(event.pageX + 10, event.pageY - 30);
        }
    );

    window.onpopstate = function restoreState(event) {
    	if (event.state && event.state.jsCode) {
    		jsCode = event.state.jsCode;
    		setCode(jsCode);
    	}
    }

// eventHandlers
	function loadStats() {
		var 
		    widgetcontainerChart;

		widgetcontainerChart = widgets.containerChart;
		
		widgetcontainerChart.loadStats(
            function loadStatsCallback(ok) {
       		    if (ok) {
       		        $('#containerChart').css('top', 327);
            		widgetcontainerChart.widgets.container.show();
		            widgetcontainerChart.show();
		        } else {
                	$.gritter.add({
                		title: 'Statistics are unavailable',
                		text: 'AWS module or Internet connection might be missing',
                		image: '/images/info.png',
                		sticky: false,
                		time: '10000'
                	});
		        }
		    }
		);
	}

	richTextStats.click = function richTextStats_click (event)
	{
		var 
		    widgetcontainerChart;

		widgetcontainerChart = widgets.containerChart;

        if (widgetcontainerChart.loadStats) {
        	loadStats();
        } else {
        	widgetcontainerChart.loadComponent({onSuccess: loadStats});
        }
		
		
	};

	iconSubmitEmail.click = function iconSubmitEmail_click (event)
	{
		newsletter.submitEmail(widgets.textFieldEmail.getValue());
		widgets.textFieldEmail.hide();
		widgets.iconSubmitEmail.hide();
		widgets.richTextWelcome.show();
	};

	containerChart.click = function containerChart_click (event)
	{
		$('#containerChart').hide();

	};
	documentEvent.onLoad = function documentEvent_onLoad (event)
	{

	};


	imageModelZoom.click = function imageModelZoom_click (event)
	{
        widgets.containerCenteredPage.hide();
        widgets.containerModelBig.show();
	};

	dataGridEmployeeStaff.onRowDblClick = function dataGridEmployeeStaff_onRowDblClick (event)
	{
        setCode('ds.Employee(' + this.source.ID + ')');
        buttonRunSSJS.click();
	};

	dataGridCountryCompanies.onRowDblClick = function dataGridCountryCompanies_onRowDblClick (event)
	{
        setCode('ds.Company(' + this.source.ID + ')');
        buttonRunSSJS.click();
	};

	dataGridCompanyEmployees.onRowDblClick = function dataGridCompanyEmployees_onRowDblClick (event)
	{
        setCode('ds.Employee(' + this.source.ID + ')');
        buttonRunSSJS.click();
	};

	dataGridEmployee.onRowDblClick = function dataGridEmployee_onRowDblClick (event)
	{
        setCode('ds.Employee(' + this.source.ID + ')');
        buttonRunSSJS.click();
	};

	dataGridCountry.onRowDblClick = function dataGridCountry_onRowDblClick (event)
	{
        setCode('ds.Country(' + this.source.ID + ')');
        buttonRunSSJS.click();
	};

	dataGridCompany.onRowDblClick = function dataGridCompany_onRowDblClick (event)
	{
        setCode('ds.Company(' + this.source.ID + ')');
        buttonRunSSJS.click();
	};

	imageModelBig.click = function imageModelBig_click (event)
	{
        widgets.containerCenteredPage.show();
        widgets.containerModelBig.hide();
	};

	containerModelBig.click = function containerModelBig_click (event)
	{
        widgets.containerCenteredPage.show();
        widgets.containerModelBig.hide();
	};

	imageModelSmall.click = function imageModelSmall_click (event)
	{
        widgets.containerModelBig.show();
        widgets.containerCenteredPage.hide();
	};

	iconDownloadButton.click = function iconDownloadButton_click (event)
	{
        window.location = DOWNLOAD_URL;
	};

	examplesListEvent.onCollectionChange = function examplesListEvent_onCollectionChange (event)
	{

	};

	examplesListEvent.onCurrentElementChange = function examplesListEvent_onCurrentElementChange (event)
	{
        //setCode(this.code);
	};

	buttonRunSSJS.click = function buttonRunSSJS_click (event)
	{
        var
            runningMethod,
            currentRequestID,
            remainingTime,
            timer,
            result,
            originalLength;

        currentCodeTip = codeTip;
        sources.codeTip.sync();
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

        jsCode = ssjsEditor.getValue();
        history.pushState({jsCode: jsCode}, document.title);

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
                statusText = 'Analyzing the server result...';
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

                    statusText = 'The result is a collection of ' + dataclass + ' Entities. ';

                    if (rawResult.__COUNT > rawResult.__SENT) {
                        statusText += "The first " + rawResult.__SENT + " of the " + rawResult.__COUNT + " entities are shown.";
                    } else {
                        statusText += "\nAll the " + rawResult.__COUNT + " entities are shown.";
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

                    statusText = 'The result is a(n) ' + dataclass + ' entity.';
                    
                    collection = ds[dataclass].newCollection();
                    collection.add(response.result);
                    source.setEntityCollection(collection);

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

                    // Exception

                    jsonResult = xhr.getResponseHeader('X-Exception');
                    if (jsonResult) {
                    	error = JSON.parse(jsonResult);
                        statusText = 'There was a "' + error.name + '" Exception during the request';
                    	richTextStatusText.setTextColor('red');
                    	mainErrorMessage = error.message;
                        currentGraphicView = widgets.errorDivServerException;
                        // setValue() doesn't work on the Display error widget
                        // currentWidget.setValue(mainErrorMessage);
                        currentGraphicView.$domNode.text(mainErrorMessage);
                        currentGraphicView.show();
                        menuItemGraphicView.enable();
                        // Show the JSON result
                    	jsonResult = toPrettyJSON(error);

                    	break;

                    }

                    // Result is a too big Array

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
                    	break;
                    }
                    
                    // Result is a value unsupported by JSON 

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
        }, jsCode, currentRequestID);

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
	};

	dataGridExamples.onRowDraw = function dataGridExamples_onRowDraw (event)
	{
        // Add your code here
	};

	dataGridExamples.onRowDblClick = function dataGridExamples_onRowDblClick (event)
	{
        if (!widgetButtonRunSSJS.isDisabled()) {
        	if (this.getSelectedRows()[0] > 0) {
                buttonRunSSJS.click();
            }
        } else {
            window.alert('A request is currently running. Please wait until the result is received');
        }
        
	};

	dataGridExamples.onRowClick = function dataGridExamples_onRowClick (event)
	{
        if (!widgetButtonRunSSJS.isDisabled()) {
        	if (this.getSelectedRows()[0] > 0) {
        		currentCode = this.source.code;
                setCode(currentCode);
            }
        } else {
            window.alert('A request is currently running. Please wait until the result is received');
        }
	};

// @region eventManager
	WAF.addListener("richTextStats", "click", richTextStats.click, "WAF");
	WAF.addListener("iconSubmitEmail", "click", iconSubmitEmail.click, "WAF");
	WAF.addListener("containerChart", "click", containerChart.click, "WAF");
	WAF.addListener("examplesList", "onCollectionChange", examplesListEvent.onCollectionChange, "WAF");
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
	WAF.addListener("iconTellUsWhatYouThink", "click", iconTellUsWhatYouThink.click, "WAF");
	WAF.addListener("imageModelZoom", "click", imageModelZoom.click, "WAF");
	WAF.addListener("dataGridEmployeeStaff", "onRowDblClick", dataGridEmployeeStaff.onRowDblClick, "WAF");
	WAF.addListener("dataGridCountryCompanies", "onRowDblClick", dataGridCountryCompanies.onRowDblClick, "WAF");
	WAF.addListener("dataGridCompanyEmployees", "onRowDblClick", dataGridCompanyEmployees.onRowDblClick, "WAF");
	WAF.addListener("dataGridEmployee", "onRowDblClick", dataGridEmployee.onRowDblClick, "WAF");
	WAF.addListener("dataGridCountry", "onRowDblClick", dataGridCountry.onRowDblClick, "WAF");
	WAF.addListener("dataGridCompany", "onRowDblClick", dataGridCompany.onRowDblClick, "WAF");
	WAF.addListener("imageModelBig", "click", imageModelBig.click, "WAF");
	WAF.addListener("containerModelBig", "click", containerModelBig.click, "WAF");
	WAF.addListener("imageModelSmall", "click", imageModelSmall.click, "WAF");
	WAF.addListener("iconDownloadButton", "click", iconDownloadButton.click, "WAF");
	WAF.addListener("dataGridExamples", "onRowDraw", dataGridExamples.onRowDraw, "WAF");
	WAF.addListener("examplesList", "onCurrentElementChange", examplesListEvent.onCurrentElementChange, "WAF");
	WAF.addListener("buttonRunSSJS", "click", buttonRunSSJS.click, "WAF");
	WAF.addListener("dataGridExamples", "onRowDblClick", dataGridExamples.onRowDblClick, "WAF");
	WAF.addListener("dataGridExamples", "onRowClick", dataGridExamples.onRowClick, "WAF");
// @endregion
};
