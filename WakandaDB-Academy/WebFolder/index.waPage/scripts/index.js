var
    WDB_ACADEMY;

// WDB_ACADEMY application namespace
WDB_ACADEMY = {
	currentSlideIndex: 3
};

WAF.onAfterInit = function onAfterInit() {// @lock
	
	"use strict";

// @region namespaceDeclaration// @startlock
	var documentEvent = {};	// @document
	var buttonPrevious = {};	// @button
	var buttonNext = {};	// @button
// @endregion// @endlock

    var
        //jsCode,
        lastSlideIndex,
        // sources
        localSources,
        sourceJsonComment,
        sourceCountryLocation,
        // widgets
        widgets,
        codeRunner,
        // wakanda widgets jQuery references
        $codeRunner,
        $buttonNext,
        $buttonPrevious,
        $componentLoading,
        // ace
        //jsonView,
        ssjsEditor;

    // index of the last slide
    lastSlideIndex = $('[data-type=component]').length - 3;

    // sources
	localSources = WAF.sources;

    // widgets
	widgets = WAF.widgets;
	codeRunner = widgets.codeRunner;
	
	// widgets jQuery reference 
	$codeRunner = codeRunner.$domNode;
	$buttonNext = widgets.buttonNext.$domNode;
	$buttonPrevious = widgets.buttonPrevious.$domNode;
	$componentLoading = widgets.componentLoading.$domNode;

	// publish references and values to components via WDB_ACADEMY namespace
	WDB_ACADEMY.$codeRunner = $codeRunner;
	WDB_ACADEMY.$buttonNext = $buttonNext;
	WDB_ACADEMY.$buttonPrevious = $buttonPrevious;
    WDB_ACADEMY.lastSlideIndex = lastSlideIndex;

    // Initialization
	//$buttonNext.fadeIn(500);

// eventHandlers// @lock

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock

        var
            key,
            api,
            domain,
            version,
            url;

        $componentLoading.fadeOut(500);

        key = 'fc3906b9efb2b865519ce99f6612f07a8d101d4870869b8718462aab9e51e788';
	    api =  "ip-city";
	    domain = 'api.ipinfodb.com';
	    version = 'v3';
	    url = "http://" + domain + "/" + version + "/" + api + "/?key=" + key + "&format=json" + "&callback=?";

        $.getJSON(
            url,
            function geoDataReceived(data) {
                if (data.statusCode === 'OK') {
                	localStorage.geoData = JSON.stringify(data);
                }
            }
        );

		if (!localStorage.userID || localStorage.userID === '') {
			localStorage.userID = GUID();
		}
		//buttonNext.click();
	};// @lock

	buttonPrevious.click = function buttonPrevious_click (event)// @startlock
	{// @endlock
        var
		    slideIndex,
		    currentSlide,
		    sample1,
		    jsCode,
		    codeRunnerTop;

		slideIndex = WDB_ACADEMY.currentSlideIndex;
		currentSlide = widgets['slide' + slideIndex];

		currentSlide.$domNode.fadeOut(1000);

		if (slideIndex === lastSlideIndex) {
			$buttonNext.fadeIn(1000);
		}

		// Changing the current slide to the new one

		slideIndex = (slideIndex > 1) ? (slideIndex - 1) : lastSlideIndex;
		WDB_ACADEMY.currentSlideIndex = slideIndex;
		currentSlide = widgets['slide' + slideIndex];
 
        if (slideIndex === 1) {
        	$buttonPrevious.fadeOut(1000);
        }

        sample1 = currentSlide.widgets.sample1;
        // Must we really remove the potential user custom code?
        jsCode = sample1 ? sample1.getValue() : '';
        WDB_ACADEMY.setCode(jsCode);

 		if (slideIndex === 1 || slideIndex === lastSlideIndex) {
			$codeRunner.fadeOut(1000);
		} else {
			$codeRunner.fadeIn(1000);
		}
		
		codeRunnerTop = (slideIndex >= lastSlideIndex - 1) ? '506px' : '152px';
		$codeRunner.css('top', codeRunnerTop);
		
		currentSlide.$domNode.fadeIn(1000);


	};// @lock

	buttonNext.click = function buttonNext_click (event)// @startlock
	{// @endlock
         var
            slideIndex,
            currentSlide,
            sample1,
            jsCode,
            codeRunnerTop;

		slideIndex = WDB_ACADEMY.currentSlideIndex;
		currentSlide = widgets['slide' + slideIndex];

		currentSlide.$domNode.fadeOut(1000);

		if (slideIndex === 1) {
			$buttonPrevious.fadeIn(1000);
		}

		if (slideIndex === (lastSlideIndex - 1)) {
	        $buttonNext.fadeOut(1000);
	    }

		// Changing the current slide to the new one

		slideIndex = (slideIndex < lastSlideIndex) ? (slideIndex + 1) : 1;
		WDB_ACADEMY.currentSlideIndex = slideIndex;
		currentSlide = widgets['slide' + slideIndex];

		if (slideIndex === 1 || slideIndex === lastSlideIndex) {
			$codeRunner.fadeOut(1000);
		} else {
			sample1 = currentSlide.widgets.sample1;
	        // TODO: Must we really remove the potential user custom code?
	        jsCode = sample1 ? sample1.getValue() : '';
	        WDB_ACADEMY.setCode(jsCode);
	        WDB_ACADEMY.selectTab(1);

            codeRunnerTop = (slideIndex >= (lastSlideIndex - 1)) ? '506px' : '152px';
		    $codeRunner.css('top', codeRunnerTop);
			$codeRunner.fadeIn(1000);
		}

		currentSlide.$domNode.fadeIn(1000);

	};// @lock

// @region eventManager// @startlock
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
	WAF.addListener("buttonPrevious", "click", buttonPrevious.click, "WAF");
	WAF.addListener("buttonNext", "click", buttonNext.click, "WAF");
// @endregion
};// @endlock
