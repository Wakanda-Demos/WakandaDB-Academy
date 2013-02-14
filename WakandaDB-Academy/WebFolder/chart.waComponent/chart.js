var toto;

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
		
		$.ajax({
		  url: "/getRequestCount",
		  success: function ( d1 ) {

			var graph;
			d1 = JSON.parse(d1)

			var max = 0;
			for (var i=0; i<d1.length ; i++){
				d1[i][0] = new Date(d1[i][0]);
				if (parseInt(d1[i][1]) > max) max = parseInt(d1[i][1])+10;
			}

			  graph = Flotr.draw(document.getElementById("containerChart_container"), [ 
			      { data : d1, label : 'Requests Count', lines : { show : true }, points : { show : true } }, 
			    ], {
			      xaxis : {
			      	mode			: 'time',
			      	timeFormat		: '%d/%m %H:%M',
			      	noTicks			: 20
			      },
			      yaxis : {
			        max : max
			      },
			      grid : {
			        verticalLines : false,
			        backgroundColor : {
			          colors : [[0,'#fff'], [1,'#ccc']],
			          start : 'top',
			          end : 'bottom'
			        }
			      },
			      legend : {
			        position : 'nw'
			      },
			      mouse : {
			        track : true,
			        relative : true
			      },			      
			      title : 'Number of requests sent to the sever',
			      subtitle : ''
			  });
		  },
		  error: function(error) {  			  	
		  }
		});	
	


	// @region eventManager// @startlock
	// @endregion// @endlock

	};// @lock


}// @startlock
return constructor;
})();// @endlock
