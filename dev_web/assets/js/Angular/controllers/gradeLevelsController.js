var CuteBrains = angular.module('gradeLevelsController', []);

CuteBrains.controller('gradeLevelsController', function(dataFactory,$rootScope,$scope) {
    $scope.gradeLevels = {};
    $scope.school_terms = {};
    $scope.views = {};
    $scope.views.list = true;
    $scope.form = {};

    $scope.$on('$viewContentLoaded', function() {
    	document.title = $('meta[name="site_title"]').attr('content') + ' | Grade levels';
    });

    dataFactory.httpRequest('index.php/gradeLevels/listAll').then(function(data) {
        $scope.gradeLevels = data.grades;
        $scope.school_terms = data.terms;
        showHideLoad(true);
    });

    // dataFactory.httpRequest('index.php/school-terms/listAll').then(function(data) {
    //     $scope.school_terms = data.terms;
    //     showHideLoad(true);
    // });

    $scope.getSchoolTerm = function(term_id) {
    	return $scope.school_terms.find(x => x.id == term_id);
    }

    $scope.saveAdd = function(){
        showHideLoad();
        dataFactory.httpRequest('index.php/gradeLevels','POST',{},$scope.form).then(function(data) {
            response = apiResponse(data,'add');
            if(data.status == "success"){
                $scope.gradeLevels.push(response);
                $scope.changeView('list');
            }
            showHideLoad(true);
        });
    }

    $scope.edit = function(id){
        showHideLoad();
        dataFactory.httpRequest('index.php/gradeLevels/'+id).then(function(data) {
            $scope.changeView('edit');
            $scope.form = data;
            showHideLoad(true);
        });
    }

    $scope.saveEdit = function(){
        showHideLoad();
        dataFactory.httpRequest('index.php/gradeLevels/'+$scope.form.id,'POST',{},$scope.form).then(function(data) {
            response = apiResponse(data,'edit');
            if(data.status == "success"){
                $scope.gradeLevels = apiModifyTable($scope.gradeLevels,response.id,response);
                $scope.changeView('list');
            }
            showHideLoad(true);
        });
    }

    $scope.remove = function(item,index){
        var confirmRemove = confirm($rootScope.phrase.sureRemove);
        if (confirmRemove == true) {
            showHideLoad();
            dataFactory.httpRequest('index.php/gradeLevels/delete/'+item.id,'POST').then(function(data) {
                response = apiResponse(data,'remove');
                if(data.status == "success"){
                    $scope.gradeLevels.splice(index,1);
                }
                showHideLoad(true);
            });
        }
    }

    $scope.changeView = function(view){
        if(view == "add" || view == "list" || view == "show"){
            $scope.form = {};
        }
        $scope.views.list = false;
        $scope.views.add = false;
        $scope.views.edit = false;
        $scope.views[view] = true;
    }
});