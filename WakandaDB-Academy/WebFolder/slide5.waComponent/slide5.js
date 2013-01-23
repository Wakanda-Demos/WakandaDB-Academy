
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
        sample1Code,
        sample2Code,
        sample3Code,
        sample4Code;

	// @region namespaceDeclaration// @startlock
	var imageSample1 = {};	// @image
	var imageSample4 = {};	// @image
	var imageSample3 = {};	// @image
	var imageSample2 = {};	// @image
	// @endregion// @endlock

	widgets = this.widgets;

    sample1Code = widgets.sample1.getValue();
    sample2Code = widgets.sample2.getValue();
    sample3Code = widgets.sample3.getValue();
    sample4Code = widgets.sample4.getValue();

	// eventHandlers// @lock

	imageSample1.click = function imageSample1_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.setCode(sample1Code + '\n' + 'MrDupond;');
	};// @lock

	imageSample4.click = function imageSample4_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.setCode(sample1Code + '\n' + sample4Code);
	};// @lock

	imageSample3.click = function imageSample3_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.setCode(sample1Code + '\n' + sample3Code);
	};// @lock

	imageSample2.click = function imageSample2_click (event)// @startlock
	{// @endlock
		WDB_ACADEMY.setCode(sample1Code + '\n' + sample2Code);
	};// @lock
	
	// @region eventManager// @startlock
	WAF.addListener(this.id + "_imageSample1", "click", imageSample1.click, "WAF");
	WAF.addListener(this.id + "_imageSample4", "click", imageSample4.click, "WAF");
	WAF.addListener(this.id + "_imageSample3", "click", imageSample3.click, "WAF");
	WAF.addListener(this.id + "_imageSample2", "click", imageSample2.click, "WAF");
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
