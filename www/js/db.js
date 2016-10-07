function initializeDB(db){
    db.transaction(function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS teams (team_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS players (player_id INTEGER PRIMARY KEY AUTOINCREMENT, team_id INTEGER, name TEXT, preferred_pos TEXT, notes TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS players_transactions (player_transaction_id INTEGER PRIMARY KEY AUTOINCREMENT, game_id INTEGER, player_id INTEGER, in_out INTEGER, top_loc TEXT, left_loc TEXT, date_entered INTEGER)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS game (game_id INTEGER PRIMARY KEY AUTOINCREMENT, team_id INTEGER, date_entered TEXT)');
    });
}