'use strict';

angular.module('playAngular', ['wakConnectorModule']);

function PlayController($scope, wakConnectorService) {
	var ready = PlayControllerReady.bind(this, $scope, wakConnectorService);
	wakConnectorService.init('Country,Company,Employee').then(ready);
}

function PlayControllerReady($scope, $wakanda) {
    
	var ds, relation, parent;
	
	ds = $wakanda.getDatastore();

	relation = {Country: 'Company', Company: 'Employee'};
	parent = {Employee: 'Company', Company: 'Country'};

    $scope.current = {};
    $scope.filter = {};
    $scope.relationLoader = {Country: loadCountries, Company: loadCompanies, Employee: loadEmployees};

    $scope.switchCurrentEntity = function switchCurrentEntity(source, current) {
        if ($scope.current[source]) {
            $scope.current[source].selected = false;
        }
        $scope.current[source] = current;
        current.selected = true;
        // autoload related entities
        if (source in relation) {
            $scope.relationLoader[relation[source]](current);
        }
    }
    
    $scope.setFilter = function filter(source) {
        $scope.relationLoader[source](
            $scope.current[parent[source]],
            $scope.filter[source]
        );
    };
    
    function formatFilter(filter, current, currentName) {
        var name = currentName === 'company' ? 'fullName' : 'name';
        filter = filter ? [name + ' = "' + filter + '*"'] : [];
        if (current) {
            filter.push(currentName + '.ID = ' + current.ID);
        }
        return {filter: filter.join(' AND ')};
    }

    function loadCountries(ignore, filter) {
        filter = formatFilter(filter);
        ds.Country.$find(filter).then(function(event) {
            $scope.countries = event.result;
            $scope.switchCurrentEntity('Country', event.result[0]);
        });
    }
    
    function loadCompanies(country, filter) {
        filter = formatFilter(filter, country, 'country');
        ds.Company.$find(filter).then(function(event) {
            $scope.companies = event.result;
            $scope.switchCurrentEntity('Company', event.result[0]);
        });
    }
    
    function loadEmployees(company, filter) {
        filter = formatFilter(filter, company, 'company');
        ds.Employee.$find(filter).then(function(event) {
            $scope.employees = event.result;
            $scope.switchCurrentEntity('Employee', event.result[0]);
        });
    }

    loadCountries();
}