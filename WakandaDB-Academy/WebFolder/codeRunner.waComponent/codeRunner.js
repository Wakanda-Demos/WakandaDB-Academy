
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'codeRunner';
	// @endregion// @endlock

	var
		ssjsEditor,
		jsonResult,
		widgets,
		localSources,
		currentWidget,
		textLimitedResults;

	function prettifyJSON(json, indent) {
		indent = indent || 4;
		return JSON.stringify(JSON.parse(json), null, indent);
	}
	
	function toPrettyJSON(value, indent) {
		indent = indent || 4;
		return JSON.stringify(value, null, indent);
	}

	widgets = this.widgets;
	localSources = this.sources;
	ssjsEditor = ace.edit(widgets.containerSsjsEditor.id);
	jsonResult = ace.edit(widgets.containerJsonResult.id);
	textLimitedResults = widgets.richTextLimitedResults;

// eventHandlers


	this.load = function (data) {// @lock

	// @region namespaceDeclaration// @startlock
	var buttonRunSSJS = {};	// @button
	// @endregion// @endlock
   
    // ACE Editor initialisations
    
    $$('codeRunner_menuResults').disable();
    $$('codeRunner_menuJSON').disable();    
    
	ssjsEditor.setTheme("ace/theme/github");
	ssjsEditor.getSession().setMode("ace/mode/javascript");
	ssjsEditor.setValue('ds.Employee.all();');
	ssjsEditor.clearSelection();
	ssjsEditor.focus();
	ssjsEditor.commands.addCommand({
	    name: 'myCommand',
	    bindKey: {win: 'Ctrl-/',  mac: 'Command-/'},
	    exec: buttonRunSSJS.click
	});
	 	    
	jsonResult.setTheme("ace/theme/github");
	jsonResult.getSession().setMode("ace/mode/json");
	jsonResult.setReadOnly(true);

	// eventHandlers// @lock

	buttonRunSSJS.click = function buttonRunSSJS_click (event)// @startlock
	{// @endlock

//		source.user.callMethod({method: "saveCode", onSuccess:function(event) {
//	        console.log("result = " + event.result);
//	    } }, ace.edit("codeRunner_containerSsjsEditor").getValue());
	
		if ($$('codeRunner_tabView1')._selected == 1) $$('codeRunner_tabView1').selectTab(3);	
		
	    $$('codeRunner_menuResults').enable();
	    $$('codeRunner_menuJSON').enable(); 
		$('#buttonNext').fadeIn(1000);
	
		textLimitedResults.hide();
		if (currentWidget) {
			currentWidget.hide();
		}
		jsonResult.setValue("");
		
		ds.Proxy.callMethod({
			method: 'runOnServer',
			onSuccess: function handleSsjsSuccess(response) {
				var
				    rawResult,
				    result,
				    isISODate,
				    dataclass,
				    collection,
				    source;

				rawResult = JSON.parse(response.XHR.responseText);
				rawResult = ((typeof rawResult === 'object') && rawResult && rawResult.hasOwnProperty('result')) ? rawResult.result : rawResult;
				
				result = response.result;
				resultType = typeof result;

				isISODate = null;

				if (result === null || resultType !== 'object') {
					
					currentWidget = widgets.richTextResult;
					currentWidget.removeClass('ace_null');
					currentWidget.removeClass('ace_undefined');
					currentWidget.removeClass('ace_boolean');
					currentWidget.removeClass('ace_numeric');
					currentWidget.removeClass('ace_string');
					
					// Handle scalar, null and Date values
					switch (resultType) {
					case 'object':
					    // null	value
					    currentWidget.addClass('ace_null');
					    break;
					case 'undefined':
					    // unfortunately not a JSON compliant value
					    currentWidget.addClass('ace_undefined');
					    break;
					case 'boolean':
					    // boolean
					    currentWidget.addClass('ace_boolean');
					    break;
					case 'number':
					    // number
					    currentWidget.addClass('ace_numeric');
					    break;
					case 'string':
					    // string or Date
					    isISODate = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(result);
					    if (isISODate !== null) {
					    	result = new Date(Date.UTC(+isISODate[1], +isISODate[2] - 1, +isISODate[3], +isISODate[4], +isISODate[5], +isISODate[6]));
					    	//WAF.widgets.richTextResultDate.setValue(result.getHours() + ':' + result.getMinutes())
							currentWidget = widgets.calendarResult;
							currentWidget.setValue(result);
							currentWidget = widgets.containerResultDate;
					    } else {
					    	currentWidget.addClass('ace_string');
						}
					    break;
					}
					
					if (isISODate === null) {
						currentWidget.setValue(String(result));
					}
					
					currentWidget.show();
			    	
			    } else if (result instanceof WAF.EntityCollection) {

					// Result is an EntityCollection

					dataclass = result.getDataClass().getName();
					source = localSources[dataclass.toLowerCase()];

					if (rawResult.__COUNT > rawResult.__SENT) {
						limitedResults = "Showing " + rawResult.__SENT + " first entities from the " + rawResult.__COUNT + " found";
					} else {
						limitedResults = "Showing the " + rawResult.__COUNT + " found entities";
					}
					WAF.sources.limitedResults.sync();
					textLimitedResults.show();
					                        
                    // clear the datasource
                    collection = ds[dataclass].newCollection();
                    source.setEntityCollection(collection)

                    // show the widget
			    	currentWidget = widgets['dataGrid' + dataclass];
					currentWidget.show();

					// fill with the result collection
					setTimeout(function() {
						source.setEntityCollection(response.result);
					}, 100);
					
					/*
                    source.query("ID > 0",
					    {
					        onResult: function() {
					        	source.setEntityCollection(response.result);
					        }	
					    }
					);
					*/
					source.setEntityCollection(response.result);

					//setTimeout(function() {currentWidget.redraw();}, 100);

			    } else if (result instanceof WAF.Entity) {

					// Result is an Entity

			    	dataclass = result.getDataClass().getName();
			    	source = localSources[dataclass.toLowerCase()];
			    	
			    	collection = ds[dataclass].newCollection();
				    collection.add(response.result);
				    source.setEntityCollection(collection);

					if (dataclass === 'Country') {
						sourceGoogleMap = result.name.getValue();
						WAF.sources.sourceGoogleMap.sync();
				    }

					currentWidget = widgets['container' + dataclass];
				    currentWidget.show();

				} else if (result instanceof Array) {
					if (result.originalLength > 40) {
						limitedResults = "Showing 40 first entities from the " + result.originalLength + " found";
					} else {
						limitedResults = "Showing the " + result.originalLength + " found entities";
					}
					WAF.sources.limitedResults.sync();
					textLimitedResults.show();
				} else {
					// other object type
					
				}
				
                // show JSON result
                jsonResult.setValue(toPrettyJSON(rawResult), 0);
				jsonResult.clearSelection();
				jsonResult.navigateTo(0, 0);
				ssjsEditor.focus();
			},

			onError: function handleSsjsError(response) {
				var
				    xhr,
				    dataURI,
				    error,
				    mainErrorMessage;

				// Binary Data are not yet natively supported by the dataprovider but can be handled via onError
				xhr = response.XHR;
				if (xhr.getResponseHeader('X-Original-Content-Type') === 'image/jpeg') {
					// show JSON result
					jsonResult.setValue(prettifyJSON(xhr.getResponseHeader('X-Image-Data')), 0);
					jsonResult.clearSelection();
					jsonResult.navigateTo(0, 0);
					ssjsEditor.focus();
					// show the image
					currentWidget = widgets.imageResult;
					currentWidget.setValue('data:image/jpeg;base64,' + encode64(xhr.responseText));
					currentWidget.show();
			    } else {
			    	error = JSON.parse(xhr.responseText).__ERROR;
			    	mainErrorMessage = error[0].message;
			    	// show message in Display Error widget
					currentWidget = widgets.errorDivResult;
					// setValue() doesn't work on the Display error widget
					// currentWidget.setValue(mainErrorMessage);
					currentWidget.$domNode.text(mainErrorMessage);
					currentWidget.show();
			    	// show JSON result
					jsonResult.setValue(toPrettyJSON(error), 0);
					jsonResult.clearSelection();
					jsonResult.navigateTo(0, 0);
					ssjsEditor.focus();
			    }
			},

			//params: [ssjsEditor.getValue()]
		}, ssjsEditor.getValue());
		
			
	};// @lock



	// @region eventManager// @startlock
	WAF.addListener(this.id + "_buttonRunSSJS", "click", buttonRunSSJS.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
