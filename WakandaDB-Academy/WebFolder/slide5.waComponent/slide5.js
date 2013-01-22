
(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'slide3';
	// @endregion// @endlock

	this.load = function (data) {// @lock

    var
        widgets,
        sample5,
        sample6,
        sample7,
        sample8;

	// @region namespaceDeclaration// @startlock
	var imageSample5 = {};	// @image
	var imageSample8 = {};	// @image
	var imageSample7 = {};	// @image
	var imageSample6 = {};	// @image
	// @endregion// @endlock

	widgets = this.widgets;

    sample5 = widgets.sample5.getValue();
    sample6 = widgets.sample6.getValue();
    sample7 = widgets.sample7.getValue();
    sample8 = widgets.sample8.getValue();

	// eventHandlers// @lock

	imageSample5.click = function imageSample5_click (event)// @startlock
	{// @endlock
		ace.edit("codeRunner_containerSsjsEditor").setValue($comp.widgets.sample1.getValue() + '\n' + 'MrDupond');

	};// @lock

	imageSample8.click = function imageSample8_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.ssjsEditor.setValue(sample5 + '\n' + sample8);
	};// @lock

	imageSample7.click = function imageSample7_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.ssjsEditor.setValue(sample5 + '\n' + sample7);
	};// @lock

	imageSample6.click = function imageSample6_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.ssjsEditor.setValue(sample5 + '\n' + sample6);
	};// @lock
	
	// @region eventManager// @startlock
	WAF.addListener(this.id + "_imageSample5", "click", imageSample5.click, "WAF");
	WAF.addListener(this.id + "_imageSample8", "click", imageSample8.click, "WAF");
	WAF.addListener(this.id + "_imageSample7", "click", imageSample7.click, "WAF");
	WAF.addListener(this.id + "_imageSample6", "click", imageSample6.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
