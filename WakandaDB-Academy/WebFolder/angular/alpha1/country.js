
angular.module('playCountryAngular', ['wakConnectorModule']);

function PlayCountryController($scope, wakConnectorService) {
    // Create a proxy of the server model
	wakConnectorService.init('Country').then(function () {
	    PlayCountryControllerReady($scope, wakConnectorService);
	});
}

function PlayCountryControllerReady($scope, $wakanda) {
	
	var Country = $wakanda.getDatastore().Country;

    Country.$find({}).then(function(event) {

        $scope.countries = event.result;

    });
}