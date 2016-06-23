var sgtApp = angular.module('sgtApp', ['firebase']);

// Directives
// Creating a directive named fb-bind that allows for direct editing
sgtApp.directive("fbBind", function(studentService) {
    return {
        restrict: "A",      // The directive will be used as an attribute only
        scope: {
            fbValue: '='    // Use '=' so the data uses 2-way binding and ultimatly creates the 3-way binding to Firebase
        },
        link: function(scope, element, attrs, ngModel) {

            // When the input looses focus (blur) get the elements value and update the firebase value
            element.bind("blur", function(e) {
                scope.$apply(function(){
                    scope.fbValue = element.val();
                });
            });

            // On focus select the element
            element.bind('focus', function(){
                element.select();
            });

            // When the enter button is pressed leave the element (Cause it to loose focus)
            element.bind('keypress', function(e){

                if(e.charCode == 13){
                    console.log('Enter pressed');
                    element.blur();
                }
            });
        }
    };
});


// Services
sgtApp.service('studentService', ['$firebaseObject', function($firebaseObject) {
    var self = this;
    this.firebaseRef= new Firebase("https://fbauthgroupb.firebaseio.com/students"); // Create the firebase object
    this.student = {};
    this.addStudent = function() {
        self.firebaseRef.push(this.student); // Send a student to the firebase DB
        this.student = {};
    };
    this.deleteStudent = function(key) {
        self.firebaseRef.child(key).remove(); // Remove a student from the firebase DB
    };
}]);


// Controllers
sgtApp.controller('MainController', ['$scope', '$firebaseObject','studentService', function($scope, $firebaseObject, studentService) {
    var self = this;
    self.ref = studentService.firebaseRef; // The firebase object from the fb service
    self.addStudent = studentService.addStudent;
    self.deleteStudent = function(key) {
        studentService.deleteStudent(key);
    };

    self.firebaseList = $firebaseObject(self.ref); // Get the data from firbase

    self.firebaseList.$bindTo($scope, 'data'); // 3-way bind the data to firebase

    // Calculates the Average - This should be moved in the future
    self.average = function(){
        var list = self.firebaseList;
        var total = 0;
        var count = 0;
        for(var key in list){
            if(list.hasOwnProperty(key)) {
                if (typeof list[key] === 'object' && list[key] != null && list[key].hasOwnProperty('grade')) {
                    total += parseFloat(list[key].grade);
                    count++;
                }
            }
        }
        var avg = 0;
        if(count != 0){
            avg = Math.round(total/count);
        }
        return avg;
    };
}]);