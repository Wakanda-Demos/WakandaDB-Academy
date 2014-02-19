'use strict';

var ds;

angular.module('playAngular', ['wakConnectorModule']);

function PlayController($scope, wakConnectorService) {
	var ready = PlayControllerReady.bind(this, $scope, wakConnectorService);
	wakConnectorService.init('Country,Company,Employee').then(ready);
}

function PlayControllerReady($scope, $wakanda) {
	
	 ds = $wakanda.getDatastore();

    $scope.countries = [];
    $scope.companies = [];
    $scope.employees = [];

    $scope.updateCurrentCountry = function updateCurrentCountry() {
        $scope.currentCountry = $scope.countries[$scope.currentCountryIndex];
        loadCompanies($scope);
    };

    $scope.updateCurrentCompany = function updateCurrentCompany() {
        $scope.currentCompany = $scope.companies[$scope.currentCompanyIndex];
        loadEmployees($scope);
    };
    
    $scope.updateCurrentEmployee = function updateCurrentEmployee() {
        $scope.currentEmployee = $scope.employees[$scope.currentEmployeeIndex];
        console.log($scope.currentEmployee);
    }

    loadCountries($scope);
}
    
function loadCountries($scope) {
    ds.Country.$find({}).then(function(event) {
        $scope.currentCountryIndex = 0;
        $scope.countries = event.result;
        $scope.updateCurrentCountry();
    });
}

function loadCompanies($scope) {
    ds.Company.$find({filter: 'country.ID = ' + $scope.currentCountry.ID}).then(function(event) {
        $scope.currentCompanyIndex = 0;
        $scope.companies = event.result;
        $scope.updateCurrentCompany();
    });
}

function loadEmployees($scope) {
    ds.Employee.$find({filter: 'company.ID = ' + $scope.currentCompany.ID}).then(function(event) {
        $scope.currentEmployeeIndex = 0;
        $scope.employees = event.result;
        $scope.updateCurrentEmployee();
    });
}