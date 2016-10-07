/**
 * Protype for the teams class. The Teams object contains a team id, team name, 
 * and the parent contains a list of teams. 
 * @returns {Teams}
 */
var Teams = function () {
  this.id = -1;
  this.name = "";
  //This will be an array of teams
  this.teamsList = {};
  this.db = window.openDatabase("Database", "1.0", "SoccerManagerIO", 200000);
  
  this.getTeams = function () {
    var teamsList = new $.Deferred();

    this.db.transaction(function(tx){
      tx.executeSql("SELECT * FROM teams", [], function(tx, results){
        teamsList.resolve(results.rows);  
      });
    });

    return teamsList.promise();
  };
  this.createTeam = function(teamName) {
    var prom = new $.Deferred();

    this.db.transaction(function(tx){
      tx.executeSql("INSERT INTO teams (name) VALUES (?)", [teamName]);
      prom.resolve("Completed");
    }); 

    return prom.promise();
  };

  return this;
};