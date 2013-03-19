/*global $, Flotr*/

(function Component (id) {// @lock

// Add the code that needs to be shared between components here

function constructor (id) {

	// @region beginComponentDeclaration// @startlock
	var $comp = this;
	this.name = 'chart';
	// @endregion// @endlock

	this.load = function (data) {// @lock

	// @region namespaceDeclaration// @startlock
	// @endregion// @endlock

	// eventHandlers// @lock

	// @region eventManager// @startlock
	// @endregion// @endlock

	};// @lock

    this.loadStats = function chartLoadStats(callback) {
        $.ajax({
            url: "/getRequestCount",

            error: function onRequestCountFailed(error) {
                console.warn('request count unvailable', error);
                if (typeof callback === 'function') {
                    callback(false);
                }
            },

            success: function onRequestCountLoaded(data) {

                var
                    graph,
                    yAxisMax;

                data = JSON.parse(data);
                yAxisMax = data.reduce(
                    function initDataDatesAndGetMax(max, current) {
                        var
                            value;

                        current[0] = new Date(current[0]);
                        value = parseInt(current[1], 10);
                        if (value > max) {
                            max = value + 10;
                        }
                        return max;
                    },
                    0
                );

                graph = Flotr.draw(
                    document.getElementById($comp.widgets.container.id),
                    [
                        {
                            data : data,
                            label : 'Requests Count',
                            lines : { show : true },
                            points : { show : true }
                        }
                    ],
                    {
                        xaxis: {
                              mode: 'time',
                              timeFormat: '%d/%m %H:%M',
                              noTicks: 20
                        },
                        yaxis: {
                            max: yAxisMax
                        },
                        grid: {
                            verticalLines: false,
                            backgroundColor: {
                                colors: [[0, '#fff'], [1, '#ccc']],
                                start: 'top',
                                end: 'bottom'
                            }
                        },
                        legend: {
                            position : 'nw'
                        },
                        mouse: {
                            track: true,
                            relative: true
                        },     
                        title: 'Number of requests sent to the sever',
                        subtitle: ''
                    }
                );
                
                if (typeof callback === 'function') {
                    callback(true);
                }

            }
        });    
    };


}// @startlock
return constructor;
})();// @endlock
