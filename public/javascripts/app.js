var app = angular.module('app', ['ngRoute', 'ngTagsInput'])
    .config(function($routeProvider, $locationProvider, $httpProvider) {
        var checkLoggedIn = function(destination) {
            return function($q, $timeout, $http, $location, $rootScope) {
                var deferred = $q.defer();
                $http.get('/passport/logged').success(function(data) {
                    if (data) {
                        if (destination === 'home') {
                            deferred.resolve();
                        } else {
                            $location.url('/home');
                            deferred.reject();
                        }
                    } else {
                        if (destination === 'login') {
                            deferred.resolve();
                        } else {
                            $location.url('/login');
                            deferred.reject();
                        }
                    }
                });
                return deferred.promise;
            }
        };
        $httpProvider.interceptors.push(function($q, $location) {
            return {
                response: function(response) {
                    // do something on success
                    return response;
                },
                responseError: function(response) {
                    if (response.status === 401) {
                        $location.url('/login');
                    }
                    return $q.reject(response);
                }
            };
        });
        $routeProvider
            .when('/home', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl',
                resolve: {
                    loggedin: checkLoggedIn('home')
                }
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    loggedin: checkLoggedIn('login')
                }
            })
            .otherwise({
                redirectTo: '/login'
            });
    }) // end of config()
    .run(function($rootScope, $http, $location) {
        $rootScope.logout = function() {
            $http.post('/passport/logout')
                .success(function() {
                    $location.url('/login');
                });
        };
    });

app.controller('LoginCtrl', function($scope, $rootScope, $http, $location) {});
app.controller('HomeCtrl', function($scope, $rootScope, $http) {
    $rootScope.loading = true; // Show loading screen
    templates = {
        'addTask': 'views/addTask.html',
        'list': 'views/list.html',
        'search': 'views/search.html',
        'home': 'views/homehome.html'
    };
    $scope.currentTemplate = 'views/homehome.html';
    $scope.me = {}; // Facebook data, lists, tasks
    $scope.search = {}; // Data for list filtering
    $scope.searchList = {}; // Opened list, used to get a name
    $scope.tags = []; // All tags used by user
    $scope.taskDetails = {}; // Opened task
    $scope.newTask = { // Template for creation of new task
        name: "",
        list: "",
        tags: [],
        description: "",
        priority: 1
    }
    $scope.creatingNewList = false; // show/hide field and button for creating a list
    $scope.listEdit = {
        edit: false, // show/hide field and button for changing a list name
        newName: "", // new name for a list
        start: function() { // Start editing
            $scope.listEdit.newName = $scope.searchList.name;
            $scope.listEdit.edit = true; // show/hide field and button for changing a list name
        },
        send: function() { // tell backend about changing name of the list
            $rootScope.loading = true;
            $http.put('/list/edit', {
                id: $scope.searchList._id,
                name: $scope.listEdit.newName
            }).success(function(result) {
                $scope.listEdit.edit = false;
                $scope.searchList.name = $scope.listEdit.newName;
                $scope.refresh();
            });
        }
    }
    $scope.countTasks = function(listId) { // Count task number in the list with listId
        var count = 0;
        $scope.me.tasks.forEach(function(element) {
            if (element.list === listId && !element.done) {
                count += 1;
            }
        })
        return count;
    }
    $scope.countPriorityColor = function(priority) { // get rgb() (rgb(255,231,102) - rgb(255,99,71)) for a given priority (1 - 100)
        var red = 255;
        var green = parseInt(132 * (100 - priority) / 100 + 99)
        var blue = parseInt(31 * (100 - priority) / 100 + 71)
        return "rgb(" + red + "," + green + "," + blue + ")";
    }
    $scope.sendNewList = function() { // send new list to backend 
        $rootScope.loading = true;
        $http.post('/list/create', {
            name: $scope.newList,
            users: [$scope.me._id]
        }).success(function() {
            $scope.newList = "";
            $scope.addingList = false;
            $scope.refresh();
        });
    }
    $scope.sendDeleteList = function(list) { // tell backend about deleting a list
        $rootScope.loading = true;
        $http.put('/list/delete', {
            id: $scope.searchList._id,
            user: $scope.me._id
        }).success(function(result) {
            $scope.currentTemplate = templates['home'];
            $scope.refresh();
        });
    }
    $scope.openList = function(list) { // select tasks which belong to that list and show
        $scope.listEdit.edit = false
        $scope.searchList = list
        $scope.currentTemplate = templates['list'];
        $scope.taskDetails = {};
        $scope.search = {
            list: list._id
        };
    }
    $scope.findTags = function(searchTag) { // select tasks which has searchTag and show
        $scope.listEdit.edit = false
        $scope.searchList = {
            name: "Search results by tag: " + searchTag.name
        }
        $scope.currentTemplate = templates['list'];
        $scope.taskDetails = {};
        $scope.search = function(value, index, array) { // Function for angular filter
            return value.tags.map(function(element) {
                return element._id
            }).indexOf(searchTag._id) !== -1;
        }
    }
    $scope.selectTask = function(task) { // Open task details
        $scope.taskDetails = task;
    }
    $scope.editNewTask = function() { // Open view for new task creation 
        $scope.currentTemplate = templates['addTask'];
        $scope.taskDetails = {};
        $scope.openedList = {};
    }
    $scope.setList = function(list) { // set list for new task creation
        $scope.newTask.list = list;
    }
    $scope.setTag = function(tag) { // add a unique tag to new task creation
        if ($scope.newTask.tags.indexOf(tag) === -1) {
            $scope.newTask.tags.push(tag);
        }
    }
    $scope.sendNewTask = function() { // send a new created task to backend
        $rootScope.loading = true;
        $http.post('/task/create', $scope.newTask).success(function(user) {
            $scope.newTask = {
                name: "",
                list: "",
                tags: [],
                description: "",
                priority: 1
            }
            $scope.refresh();
        });
    }
    $scope.sendCompleteTask = function(task) { // tell backend about task completion
        $rootScope.loading = true;
        $http.put('/task/done', {
            id: task._id,
            done: !task.done
        }).success(function(result) {
            $scope.refresh();
        });
    }
    $scope.sendDeleteTask = function(task) { // tell backend about task deletion
        $rootScope.loading = true;
        $http.put('/task/delete', {
            id: task._id
        }).success(function(result) {
            $scope.refresh();
        });
    }
    $scope.refresh = function(callback) { // get info about user, tasks, lists, tags
        $http.get('/me').success(function(user) {
            $scope.tags = [];
            $scope.me = user;
            $scope.me.tasks.forEach(function(task) { // filling tags[] array
                task.tags.forEach(function(tag) {
                    var unique = $scope.tags.filter(function(element) {
                        return element._id === tag._id;
                    }).length;
                    if (unique === 0) {
                        $scope.tags.push(tag);
                    }
                })
            })
            if (callback) {
                callback();
            }
            $rootScope.loading = false;
        });
    }
    $scope.refresh();
})