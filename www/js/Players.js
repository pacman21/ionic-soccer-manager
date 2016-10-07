/**
 * The Players class has teamID, playerName, 
 * preferredPos - which is the preferred position the player players, notes and 
 * playersList - which contains an array of players
 * @returns {Players}
 */
var Players = function(){
  this.teamID;
  this.playerID;
  this.playerName;
  this.preferredPos;
  this.notes;
  this.playersList = [];
  this.db = window.openDatabase("Database", "1.0", "SoccerManagerIO", 200000);
  
  /**
   * Accepts the teamID and returns a promise, which will later be filled with 
   * a Player object that has a playersList filled with all of the players 
   * @param {type} teamID
   * @returns {unresolved}
   */
  this.getPlayers = function(teamID){
    this.teamID = teamID;
    var prom = new $.Deferred();
    this.playersList = [];
    var _self = this;
    
    this.db.transaction(function(tx){
      tx.executeSql("SELECT * FROM players WHERE team_id = ? ORDER BY name ASC",
        [teamID], function(tx, results){
        _self.initValues(results.rows);
        prom.resolve(_self);
      });
    });
    
    return prom.promise();
  };
  
  
  /**
   * Gets a player object given the player ID. 
   * Returns a promise that will later be filled with a single player object
   * @param {type} playerID
   * @returns {unresolved}
   */
  this.getPlayer = function(playerID){
    var prom = new $.Deferred();
    var _self = this;
    
    this.db.transaction(function(tx){
      tx.executeSql("SELECT * FROM players WHERE player_id = ?", 
        [playerID], function(tx, results){
        _self.initValues(results.rows);
        prom.resolve(_self);
      });
    });
    
    return prom.promise();
  };
  
  /**
   * Accepts the player name, their preferred position, notes about them, and 
   * returns a promise that is essentially not used for anything.
   * @param {type} name
   * @param {type} preferredPos
   * @param {type} notes
   * @returns {String.promise}
   */
  this.createPlayer = function(name, preferredPos, notes){
    var prom = new $.Deferred();
    
    this.db.transaction(function(tx){
      tx.executeSql("INSERT INTO players (team_id, name, preferred_pos, notes) VALUES (?, ?, ?, ?)", 
        [teamID, name, preferredPos, notes]);
      prom.resolve(name);
    }); 
    
    return prom.promise();
  };
  
   /**
   * Accepts the playerID, player name, their preferred position, notes about them, and 
   * returns a promise that is essentially not used for anything.
   * @param {type} playerID
   * @param {type} name
   * @param {type} preferredPos
   * @param {type} notes
   * @returns {String.promise}
   */
  this.updatePlayer = function(playerID, name, preferredPos, notes){
    var prom = new $.Deferred();
    
    this.db.transaction(function(tx){
      tx.executeSql("UPDATE players SET team_id = ?, name = ?, preferred_pos = ?, notes = ? \
        WHERE player_id = ?", 
        [teamID, name, preferredPos, notes, playerID]);
      prom.resolve(name);
    }); 
    
    return prom.promise();
  };
  
   /**
   * Accepts the playerID and removes that playerID from the team
   * returns a promise with the playerID.
   * @param {type} playerID
   * @returns {String.promise}
   */
  this.removePlayer = function(playerID){
    var prom = new $.Deferred();
    
    this.db.transaction(function(tx){
      tx.executeSql("DELETE FROM players WHERE team_id = ? AND player_id = ?", 
        [teamID, playerID]);
      prom.resolve(playerID);
    }); 
    
    return prom.promise();
  };
  
  /**
   * Private function that stores the playersList into 
   * @param {type} results
   * @returns {undefined}
   */
  this.initValues = function(results){
    var multi = false;
    if(results.length > 1){
      multi = true;
    }
    
    for(var i =0; i < results.length; i++){
      
      if(multi){
        var p = new Players();
      } else {
        var p = this;
      }
      
      p.teamID = teamID;
      p.playerID = results.item(i).player_id;
      p.playerName = results.item(i).name;
      p.preferredPos = results.item(i).preferred_pos;
      p.notes = results.item(i).notes;
 
      this.playersList.push(p);
    }
  };
  
  return this;
};


