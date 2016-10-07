starter
.controller('manageSubsCtrl', function($scope, $stateParams) {
  showMenu(true, $scope);
  showBench(true, $scope);
  defaultTitle($scope);
  
  $scope.$root.teamID = $stateParams.teamID;
  teamID = $stateParams.teamID;
  
  var gameID = 1; 
  
  setUpField(gameID, teamID, $scope);
  
  var firstClick = null;
  var firstClickPlayerID = null;
  
  $scope.$root.newGame = function(){
    $scope.$root.teamID = $stateParams.teamID;
    teamID = $stateParams.teamID;
    setUpField(gameID, teamID, $scope);
  };
  
  $scope.$root.subInOut = function(row, col, item){
    //Row -1 is returned when the person is on the bench.
    switch(firstClick){
      //If firstClick is null, then we know this was the first click
      case null:
        //Lets set the firstClick, since it's not set
        firstClick = isIn(row);
        firstClickPlayerID = getPlayerID(item);
          
        if(!definedValue(firstClickPlayerID)){
          //Let's try it again: 
          alert("Please select a player first, and then an empty position");
          firstClick = null;
        } else {
          var p = new Players();
          p.getPlayer(firstClickPlayerID).done(function(player){
            $scope.$root.title = "Subbing: " + player.playerName;
            $scope.$apply();
          });
        }
        break;
      //If firstClick is true, then know that they started in the field
      case true:
      //If firstClick is false, then we know that we started on the bench
      case false:
        var secondClick = isIn(row);
        var pt = new PlayerTransactions();
        
        //Only allow the sub if they are both on the field, or ones on and ones off
        if(secondClick != firstClick || secondClick){
          //Add A transaction to FirstClick going to this location
          var prom1 = pt.addTransaction(firstClickPlayerID, gameID, row, col);
          //Check if secondClick has an ID to it
          var secondPlayerID = getPlayerID(item);
          
          if(secondPlayerID != null && secondPlayerID != ""){
            //If it does, then let's move the second click to the bench
            var prom2 = pt.addTransaction(secondPlayerID, gameID, "-1", "-1");
            //When all of our promises are accounted for, let's rebuild the field
            $.when(prom1, prom2 ).done(function () {
              setUpField(gameID, teamID, $scope);
            });
          } else {
            $.when(prom1 ).done(function () {
              setUpField(gameID, teamID, $scope);
            });
          }
        } else {
          alert("This player is already on the bench");
        }
        firstClick = null;
        defaultTitle($scope);
        break;
    }
  };
  
  $scope.$root.newHalf = function(){
    var teamID = $scope.$root.teamID;
    var gameID = 1;
    
    var pt = new PlayerTransactions();
    var completed = [];
    
    //Gets a list of all of the players and where they are located
    pt.getRecentTransactions(gameID, teamID).done(function(transactions){
      //Let's loop through the transcations so we can recreate them with a new time
      for(var tran in transactions.activeTransactions){
        //Get all of the active transcations
        var newPT = transactions.activeTransactions[tran];
        //Returns a promise that we are going to use if all items are completed
        completed.push(pt.addTransaction(newPT.playerID, 1, newPT.row, newPT.col));
      };
      
      if(typeof transactions.activeTransactions != "undefined"){
        var totalTrans = transactions.activeTransactions.length; 
        var completedTrans = 0;
               
        $.when.apply( null, completed ).done(function() {
          setUpField(gameID, teamID, $scope);
        });
      }
    });
  };
  
});

function getPlayerID(item){
  return definedValue(item.target.getAttribute("data-player-id")) 
    ? item.target.getAttribute("data-player-id") 
    : $(item.target).parents(".active_player_holder").attr("data-player-id"); 
}

function definedValue(pid){
  if(typeof pid == "undefined"  
    || pid == null 
    || pid == ""
  ){
    return false;
  }
  
  return true;
}

function isIn(row){
  if(row == -1){
    return false;
  } else {
    return true;
  }
}

Date.prototype.customFormat = function(formatString){
  var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
  YY = ((YYYY=this.getFullYear())+"").slice(-2);
  MM = (M=this.getMonth()+1)<10?('0'+M):M;
  MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
  DD = (D=this.getDate())<10?('0'+D):D;
  DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][this.getDay()]).substring(0,3);
  th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
  formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);
  h=(hhh=this.getHours());
  if (h==0) h=24;
  if (h>12) h-=12;
  hh = h<10?('0'+h):h;
  hhhh = h<10?('0'+hhh):hhh;
  AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
  mm=(m=this.getMinutes())<10?('0'+m):m;
  ss=(s=this.getSeconds())<10?('0'+s):s;
  return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
};

function defaultTitle($scope){
  $scope.$root.title = "Manage Subs";
}

function setUpField(gameID, teamID, $scope){
  var pt = new PlayerTransactions();
  
  //Get a list of where each player is. Let's set who is in and where, and who is it
  pt.getRecentTransactions(gameID, teamID).done(function(transactions){
    var benchPlayers = [];
    var activePlayers = [];
    
    for(var i = 1; i<=7; i++){
      activePlayers[i] = [];
    }
  
    //Loop through and check whether the player is on the bench or not
    for(var tran in transactions.activeTransactions){
        //Get the inOut value. if it is out, or null. Then he is on the bench
        var inOut = transactions.activeTransactions[tran].inOut;
        
        //We need to store the date entered information into a usable format
        if(inOut != null
          && transactions.activeTransactions[tran].dateEntered != null
          && transactions.activeTransactions[tran].dateEntered != ""
        ){
          var dateEntered = transactions.activeTransactions[tran].dateEntered;
          var date = new Date(dateEntered);
          transactions.activeTransactions[tran].dateEntered = date.customFormat( "#hh#:#mm#" )
        }
        
        if(inOut == "out" || inOut == null 
          || typeof transactions.activeTransactions[tran].row == "undefined"
          || transactions.activeTransactions[tran].row == null
        ){
          benchPlayers.push(transactions.activeTransactions[tran]);
        } else {
          var row = parseInt(transactions.activeTransactions[tran].row);
          var col = parseInt(transactions.activeTransactions[tran].col);
          
          activePlayers[row][col] = transactions.activeTransactions[tran];
        }
    }
    
    //Store all of the bench players into the bench players object
    $scope.$root.benchPlayers = benchPlayers;
    $scope.$root.activePlayers = activePlayers;
    $scope.$apply();
  });
}