var currentSlide = 1;
var lastSlide;

function copyCode(index){
	var code = document.getElementById('code' + index).innerText;
	ace.edit('codeRunner_containerSsjsEditor').setValue(code);
}

WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var documentEvent = {};	// @document
	var buttonPrevious = {};	// @button
	var buttonNext = {};	// @button
// @endregion// @endlock

// eventHandlers// @lock

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock

	  $('#componentLoading').fadeOut(500);
	  $('#buttonNext').fadeIn(500);

	  var key = 'fc3906b9efb2b865519ce99f6612f07a8d101d4870869b8718462aab9e51e788';
	  var api =  "ip-city";
	  var domain = 'api.ipinfodb.com';
	  var version = 'v3';
	  var url = "http://" + domain + "/" + version + "/" + api + "/?key=" + key + "&format=json" + "&callback=?";

      $.getJSON(url,function(data){
        if (data['statusCode'] == 'OK') localStorage['geoData'] = JSON.stringify(data);
      });

		if (!localStorage['userID'] || localStorage['userID'] == '') localStorage['userID'] = GUID();
	};// @lock
	
	lastSlide = $('[data-type=component]').length-2;

	buttonPrevious.click = function buttonPrevious_click (event)// @startlock
	{// @endlock
		$('#slide' + currentSlide).fadeOut(1000);
		if (currentSlide == lastSlide) $('#buttonNext').fadeIn(1000);

		currentSlide = (currentSlide >1) ? currentSlide-1 : lastSlide;
 		if ($$('slide' + currentSlide +'_sample1')) {
			ace.edit('codeRunner_containerSsjsEditor').setValue($$('slide' + currentSlide +'_sample1').getValue());
		} else {
			ace.edit('codeRunner_containerSsjsEditor').setValue('');
		}
		$$('codeRunner_tabView1').selectTab(1);
 		if (currentSlide == 1 || currentSlide == lastSlide) {
			$('#codeRunner').fadeOut(1000);
		} else {
			$('#codeRunner').fadeIn(1000);
		}
		
		if (currentSlide >= lastSlide-1 ) {
			$('#codeRunner').css('top', '506px');
		} else {
			$('#codeRunner').css('top', '152px');
		}
		
		$('#slide' + currentSlide).fadeIn(1000);	
		
	};// @lock

	buttonNext.click = function buttonNext_click (event)// @startlock
	{// @endlock
 
		$('#slide' + currentSlide).fadeOut(1000);
		if (currentSlide == 1) $('#buttonPrevious').fadeIn(1000);
		if (currentSlide == lastSlide-1) $('#buttonNext').fadeOut(1000);

		currentSlide = (currentSlide <lastSlide) ? currentSlide+1 : 1;
		if ($$('slide' + currentSlide +'_sample1')) {
			ace.edit('codeRunner_containerSsjsEditor').setValue($$('slide' + currentSlide +'_sample1').getValue());
		} else {
			ace.edit('codeRunner_containerSsjsEditor').setValue('');
		}
		$$('codeRunner_tabView1').selectTab(1);
		if (currentSlide == 1 || currentSlide == lastSlide) {
			$('#codeRunner').fadeOut(1000);
		} else {
			$('#codeRunner').fadeIn(1000);
		}

		if (currentSlide >= lastSlide-1 ) {
			$('#codeRunner').css('top', '506px');
		} else {
			$('#codeRunner').css('top', '152px');
		}
		
		$('#slide' + currentSlide).fadeIn(1000);	
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
	WAF.addListener("buttonPrevious", "click", buttonPrevious.click, "WAF");
	WAF.addListener("buttonNext", "click", buttonNext.click, "WAF");
// @endregion
};// @endlock
