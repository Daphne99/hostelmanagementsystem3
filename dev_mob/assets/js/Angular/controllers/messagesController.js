var CuteBrains = angular.module('messagesController', []);

CuteBrains.controller('messagesController', function(dataFactory,$rootScope,$route,$scope,$location,$routeParams) {
    $scope.messages = {};
    $scope.message = {};
    $scope.messageDet = {};
    $scope.totalItems = 0;
    $scope.views = {};
    $scope.selectedAll = false;
    $scope.repeatCheck = true;
    $scope.form = {};
    $scope.messageBefore;
    $scope.messageAfter;
    $scope.userRole = $rootScope.dashboardData.role;
    var routeData = $route.current;
    var currentMessageRefreshId;
    var messageId;
    $scope.viewModal = false;
    $scope.random_value = Math.random();
    $scope.peek = {id: "", name: "", message: "", time: "", status: false};

    $scope.totalItems = 0;
    $scope.pageChanged = function(newPage) {
        getResultsPage(newPage);
    };

    $scope.$on('$viewContentLoaded', function() {
    	document.title = $('meta[name="site_title"]').attr('content') + ' | Messages';
        $('.my-custom-modal-dir').modal('hide');
        $('.modal-backdrop').css('display', 'none');

    	setTimeout(function(){
    		$('.chat-content').click(function(){
	    		$(this).parent().find('.chat-time').slideToggle();
	    	});
            $(".chat-list").animate({ scrollTop: $('.chat-list').prop("scrollHeight")}, 500);
            $('.modal-backdrop').css('display', 'none');
    	}, 800)
    });

    $scope.peekMessage = function(id){
        dataFactory.httpRequest('index.php/messages/peek/'+id).then(function(data){
            if( data.status == "success" )
            {
                $scope.peek = {id: id, name: data.details.sender, message: data.details.messageText, time: data.details.dateSentH, status: true};
            } else { $scope.peek.id = id; $scope.peek.status.false; }
            $scope.viewModal = !$scope.viewModal;
        });
    }

    $scope.closePeek = function(id){
        $scope.viewModal = !$scope.viewModal;
        $('.my-custom-modal-dir').modal('hide');
        $scope.$apply();
        setTimeout(function(){
            window.location.href = "portal#messages/" + id;
            $('.modal-backdrop').css('display', 'none');
        }, 800);
    }

    $scope.showMessage = function(id){
        $scope.repeatCheck = true;
        showHideLoad();
        dataFactory.httpRequest('index.php/messages/'+id).then(function(data) {
            data = successOrError(data);
            if(data){
                messageId = id;
                $scope.changeView('read');
                $scope.message = data.messages.reverse();
                $scope.messageDet = data.messageDet;
                if($scope.message[0]){
                    $scope.messageBefore = $scope.message[0].dateSent;
                }
                if($scope.message[$scope.message.length - 1]){
                    $scope.messageAfter = $scope.message[$scope.message.length - 1].dateSent;
                }
                currentMessageRefreshId = setInterval(currentMessagePull, 600000);
                $("#chat-box").slimScroll({
                	scrollTo: $("#chat-box").prop('scrollHeight')+'px',
                	touchScrollStep: 30,
                	start: 'bottom',
                });
                
                $("#chat-box").mCustomScrollbar({ theme:"minimal-dark", contentTouchScroll: 75, documentTouchScroll: true });
                $("#chat-box").mCustomScrollbar("update");
                setTimeout(function(){
                    $("#chat-box").mCustomScrollbar("scrollTo","bottom");
                    $('.my-custom-modal-dir').modal('hide');
                    $scope.viewModal = false;
                    $scope.$apply();
                },1000);
            }
            showHideLoad(true);
        });
    }

    if($routeParams.messageId){
        $scope.showMessage($routeParams.messageId);
    }

    function getResultsPage(pageNumber) {
        dataFactory.httpRequest('index.php/messages/listAll/'+pageNumber).then(function(data) {
            $scope.messages = data.messages;
            $scope.totalItems = data.totalItems;
            showHideLoad(true);
        });
    }

    $scope.checkAll = function(){
        $scope.selectedAll = !$scope.selectedAll;
        angular.forEach($scope.messages, function (item) {
            item.selected = $scope.selectedAll;
        });
    }

    $scope.loadOld = function(){
        dataFactory.httpRequest('index.php/messages/before/'+$scope.messageDet.fromId+'/'+$scope.messageDet.toId+'/'+$scope.messageBefore).then(function(data) {
            angular.forEach(data, function (item) {
                $scope.message.splice(0, 0,item);
            });
            if(data.length == 0){
                $('#loadOld').hide();
            }
            $scope.messageBefore = $scope.message[0].dateSent;
        });
    }

    $scope.markRead = function(){
        $scope.form.items = [];
        angular.forEach($scope.messages, function (item, key) {
            if($scope.messages[key].selected){
                $scope.form.items.push(item.id);
                $scope.messages[key].messageStatus = 0;
            }
        });
        dataFactory.httpRequest('index.php/messages/read',"POST",{},$scope.form).then(function(data) {
            response = apiResponse(data,'edit');
        });
    }

    $scope.markUnRead = function(){
        $scope.form.items = [];
        angular.forEach($scope.messages, function (item, key) {
            if($scope.messages[key].selected){
                $scope.form.items.push(item.id);
                $scope.messages[key].messageStatus = 1;
            }
        });
        dataFactory.httpRequest('index.php/messages/unread',"POST",{},$scope.form).then(function(data) {
            response = apiResponse(data,'edit');
        });
    }

    $scope.markDelete = function(){
        $scope.form.items = [];
        var len = $scope.messages.length
        while (len--) {
            if($scope.messages[len].selected){
                $scope.form.items.push($scope.messages[len].id);
                $scope.messages.splice(len,1);
            }
        }
        dataFactory.httpRequest('index.php/messages/delete',"POST",{},$scope.form).then(function(data) {
            response = apiResponse(data,'remove');
        });
    }

    var currentMessagePull = function(){
        return;
        if('#/messages/'+messageId == location.hash){
            dataFactory.httpRequest('index.php/messages/ajax/'+$scope.messageDet.fromId+'/'+$scope.messageDet.toId+'/'+$scope.messageAfter).then(function(data) {
                angular.forEach(data, function (item) {
                    $scope.message.push(item);
                    var newH = parseInt($("#chat-box").prop('scrollHeight')) + 100;
                    $("#chat-box").slimScroll({ scrollTo: newH+'px' });
                });
                if($scope.message[$scope.message.length - 1]){
                    $scope.messageAfter = $scope.message[$scope.message.length - 1].dateSent;
                }
            });
        }else{
            clearInterval(currentMessageRefreshId);
        }
    };

    $scope.replyMessage = function(){
        if($scope.form.reply != "" && typeof $scope.form.reply != "undefined"){
            $scope.form.disable = true;
            $scope.form.toId = $scope.messageDet.toId;
            dataFactory.httpRequest('index.php/messages/'+$scope.messageDet.id,'POST',{},$scope.form).then(function(data) {
                $("#chat-box").slimScroll({ scrollTo: $("#chat-box").prop('scrollHeight')+'px', touchScrollStep: 30 });
                $("#chat-box").mCustomScrollbar({ theme:"minimal-dark", contentTouchScroll: 75, documentTouchScroll: true });
                $("#chat-box").mCustomScrollbar("update");
                setTimeout(function(){
                    $("#chat-box").mCustomScrollbar("scrollTo","bottom");
                    $('.my-custom-modal-dir').modal('hide');
                    $scope.viewModal = false;
                    $scope.$apply();
                },1000);
                $scope.form = {};
            });
        }
    }

    $scope.changeView = function(view){
        if(view == "read" || view == "list" || view == "create"){
            $scope.form = {};
        }
        if(view == "list" || view == "create"){
            clearInterval(currentMessageRefreshId);
            getResultsPage(1);
        }
        $scope.views.list = false;
        $scope.views.read = false;
        $scope.views.create = false;
        $scope.views[view] = true;
    }

    $scope.changeView('list');
    $('.my-custom-modal-dir').modal('hide');
    $('.modal-backdrop').css('display', 'none');
});