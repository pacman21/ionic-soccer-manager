var starter = angular.module('starter.controllers', []);

starter
.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  
})
.controller('TeamsCtrl', function($scope) {
  showMenu(false, $scope);
  showBench(false, $scope);
  
  var teams = new Teams;
  $scope.teamData;

  getTeams($scope, false);
  
  //Creates the team from the given data on the teams.html template
  $scope.createTeam = function() {
    var teams = new Teams;
    //This is passed from the submission of the team form
    if(typeof this.teamData.teamName != 'undefined' 
      && this.teamData.teamName != null
    ){
      var _self = this;
      teams.createTeam(this.teamData.teamName).done(function(){
        getTeams(_self, true);
      });
    }
  };
})
.controller('addPlayerCtrl', function($scope, $stateParams) {  
  showMenu(true, $scope);
  showBench(false, $scope);
  
  $scope.$root.teamID = $stateParams.teamID;
  teamID = $stateParams.teamID;
  
  setTeamPlayers(teamID, $scope, false);
  
  //Creates or updates the player from the given data on the addPlayers.html template
  $scope.createUpdatePlayer = function() {
    //This is passed from the submission of the team form
    if(typeof this.playerData.playerName != 'undefined' 
      && this.playerData.playerName != null
    ){
      if(typeof this.playerData.playerID == "undefined" 
        || this.playerData.playerID  == ""
      ){
        var pd = this.playerData;
        var p = new Players();
        p.createPlayer(pd.playerName, pd.prefPos, pd.notes).done(function(name){
          setTeamPlayers(teamID, $scope, true);
        });
      } else {
        var pd = this.playerData;
        var p = new Players();
        p.updatePlayer(pd.playerID, pd.playerName, pd.prefPos, pd.notes).done(function(name){
          setTeamPlayers(teamID, $scope, true);
        });
      }
    } else {
      alert("Please enter the player's name");
    }
  };
  
  //Loads the player info into the form so we can update the information
  $scope.editPlayer = function(playerID){
    var p = new Players();
    var _self = this;

    p.getPlayer(playerID).done(function(player){
      _self.playerData.playerName = (player.playerName != "undefined") ? player.playerName : "";
      _self.playerData.prefPos = (player.preferredPos != "undefined") ? player.preferredPos : "";
      _self.playerData.notes = (player.notes != "undefined") ? player.notes : "";
      _self.playerData.playerID = player.playerID;
      $scope.$apply();
    });
  };
  
  //Deletes the player from the team
  $scope.removePlayer = function(playerID) {
    var p = new Players();
    p.removePlayer(playerID).done(function(){
      setTeamPlayers(teamID, $scope, true);
    });
  };
});

function setTeamPlayers(teamID, $scope, apply){
  $scope.playerData = [];
  
  var p = new Players();
  
  p.getPlayers(teamID).done(function(player){
    $scope.playerData = player.playersList;
    if(apply){
      $scope.$apply();
    }
  });
}

function showMenu(boo, $scope){
  $scope.$root.showMenu = boo;
}

function showBench(boo, $scope){
  $scope.$root.showBench = boo;
}

function getTeams($scope, apply){
  var teams = new Teams;
  
  //Need to fix this because this won't work asynchronously
  teams.getTeams().done(function(ret){
    var arr = [];
    for(var i =0; i < ret.length; i++){
      arr.push(ret.item(i));
    }
    $scope.teamData = arr;
    if(apply){
      $scope.$apply();
    }
  });
}