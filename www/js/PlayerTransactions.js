/* 
 * The PlayerTransactions class has player_id, in_out, game_id, and date_entered
 */
var PlayerTransactions = function(){
  this.playerName;
  this.playerID;
  this.gameID = "";
  this.inOut = "";
  this.row = "";
  this.col = "";
  this.dateEntered = "";
  this.activeTransactions = [];
  this.db = window.openDatabase("Database", "1.0", "SoccerManagerIO", 200000);
  
  /***
   * This function is used when a player changes position on the manage subs tab.
   * Accepts PlayerID, gameID, row, and col. 
   * Returns a promise with the value of the gameID
   * @param {type} playerID
   * @param {type} gameID
   * @param {type} row
   * @param {type} col
   * @returns {unresolved}
   */
  this.addTransaction = function(playerID, gameID, row, col){
    var prom = new $.Deferred();
    var inOut = "in";
    
    if(row < 0){
      inOut = "out";
    }
    
    var now = new Date();
    var t = now.getTime();
    
    this.db.transaction(function(tx){
      tx.executeSql("INSERT INTO players_transactions (game_id, player_id, in_out, top_loc, left_loc, date_entered) \
        VALUES(?, ?, ?, ?, ?, ?)", [gameID, playerID, inOut, row, col, t]);
      prom.resolve(gameID);
    });
    
    return prom.promise();
  };
  
  /***
   * This function is used to get the active state of the game that is passed in.
   * @param {type} gameID
   * @param {type} teamID
   * @returns {unresolved}
   */
  this.getRecentTransactions = function(gameID, teamID){
    var prom = new $.Deferred();
    var _self = this;
    
    this.db.transaction(function(tx){
      var sql = "SELECT p.*, player_transaction_id, in_out, top_loc, left_loc, pt.date_entered status_time \
                  FROM players p\n\
                  LEFT JOIN players_transactions pt ON pt.player_id = p.player_id  \
                      AND pt.game_id = ? \
                      AND pt.player_transaction_id IN (\
                          SELECT max(player_transaction_id) FROM players_transactions \
                          WHERE game_id = ? GROUP BY player_id)\
                  WHERE team_id = ?";
      tx.executeSql(sql, [gameID, gameID, teamID], function(tx, results){
        var len = results.rows.length;
           
        for (var i = 0; i < len; i++) {
          var pt = new PlayerTransactions();
          pt.playerID = results.rows.item(i).player_id;
          pt.playerName = results.rows.item(i).name;
          pt.dateEntered = results.rows.item(i).status_time;
          pt.row = results.rows.item(i).top_loc;
          pt.col = results.rows.item(i).left_loc;
          pt.inOut = results.rows.item(i).in_out;
          _self.activeTransactions.push(pt);
        }
        
        prom.resolve(_self);
      });
    });
    
    return prom.promise();
  };
  
  return this;
};

