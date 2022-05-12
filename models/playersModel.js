var pool = require('./connection.js')




// pmId, deckId    (posId)
// match has ended -- Later
// pm is on a state that can play the card
// pm owns the deck card
// deck card is on the hand

module.exports.getPlayerDeckCard = async function (pmId,deckId) { 
    try {
        let sqlDeck = `Select * from deck
                       where deck_id = $1 and deck_pm_id = $2`;
        let res = await pool.query(sqlDeck, [deckId,pmId]);
        if (res.rows.length > 0) { // I'm the owner of the deck card
            return {status: 200, result: res.rows[0]};
        } else {
            return {status:400, 
                    result:{msg: "The player does not own that card"} };
        }    
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }    
}


module.exports.getOpponent = async function (pmId,matchId) { 
    try {
        let sqlOp = `select * from playermatch
                    where pm_match_id =$1 and pm_id != $2`;
        let res = await pool.query(sqlOp, [matchId,pmId]);
        if (res.rows.length == 0)
            return {status: 400, result: {msg: "That match has no opponent" }};
        else 
            return {status: 200, result: res.rows[0]};
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }    
}



module.exports.attack = async function (pmId, deckId,opDeckId) { 
    try {
        let res = await this.getPlayerMatchInfo(pmId);
        if (res.status != 200) return res;
        let player = res.result;
        if (player.pm_state_id != 1) 
            return {status:400, result: {msg:"Cannot play a card at this moment"}};        
        
        res =  await this.getPlayerDeckCard(pmId,deckId);
        if (res.status != 200) return res;
        let playerCard = res.result;
        if (playerCard.deck_pos_id != 1)
            return {status:400, result: {msg:"That card is not on the hand to be played"}};

        res =  await this.getOpponent(pmId,player.mt_id);
        if (res.status != 200) return res;
        let opponent = res.result;
        
        

    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
      }    
  }


module.exports.playCard = async function (pmId, deckId) { 
    try {
        let res = await this.getPlayerMatchInfo(pmId);
        if (res.status != 200) return res;
        let player = res.result;
        if (player.pm_state_id != 1) 
            return {status:400, result: {msg:"Cannot play a card at this moment"}};        
        
        res =  await this.getPlayerDeckCard(pmId,deckId);
        if (res.status != 200) return res;
        let playerCard = res.result;
        if (playerCard.deck_pos_id != 1)
            return {status:400, result: {msg:"That card is not on the hand to be played"}};

        let sqlUpCard = `update deck set deck_pos_id = 3
                         where deck_id = $1`;
        await pool.query(sqlUpCard, [deckId]);

        let sqlUpPlayerState = `update playermatch set pm_state_id = 2
                         where pm_id = $1`;
        await pool.query(sqlUpPlayerState, [pmId]);

        return {status:200, result:{msg:"Card was successfully played on the table"}}
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
      }    
  }
  



module.exports.getPlayerDeck = async function (pId,pmId) { 
    try {
        let sqlCheck = `select * from playermatch where pm_player_id = $1 and pm_id = $2`;
        let resultCheck = await pool.query(sqlCheck, [pId,pmId]);
        if (resultCheck.rows.length > 0) { // I'm the owner of the deck
            let sql = `select deck_id, deck_pm_id, deck_pos_id, deck_card_id, deck_card_hp,
            cp_name, crd_name, crd_description
            from deck, cardpos, card 
            where deck_pm_id = $1 and
                deck_pos_id = cp_id and
                deck_card_id = crd_id`;
            let result = await pool.query(sql, [pmId]);
            let cards = result.rows;
            return { status: 200, result: cards };
        }
        let sqlCheckOp = `
            select * from playermatch 
            where pm_player_id = $1 and pm_match_id IN
                (select pm_match_id from playermatch where pm_id = $2)`;
        let resultCheckOp = await pool.query(sqlCheckOp, [pId,pmId]);
        
        if (resultCheckOp.rows.length > 0) {
            let sql = `select deck_id, deck_pm_id, deck_pos_id, deck_card_id, deck_card_hp,
            cp_name, crd_name, crd_description
            from deck, cardpos, card 
            where deck_pm_id = $1 and
                deck_pos_id = cp_id and
                deck_card_id = crd_id and
                (cp_name LIKE 'Table' or  cp_name LIKE 'TablePlayed')  `;
            let result = await pool.query(sql, [pmId]);
            let cards = result.rows;
            return { status: 200, result: cards };
        } 
        return { status: 401, result: { msg: "You are not playing in this match"} };
        
    } catch (err) {
      console.log(err);
      return { status: 500, result: err };
    }    
}




module.exports.getPlayerMatchInfo = async function (pmId) { 
    try {
        let sql = `	select pm_id, pm_state_id, pm_hp, pms_name, mt_id, mt_turn, mt_finished, ply_name, ply_id  
        from  playermatch, pmstate, match, player  
        where 
          pm_player_id = ply_id and
          pm_state_id = pms_id and
          pm_match_id = mt_id and
          pm_id = $1`;
        let result = await pool.query(sql, [pmId]);
        if (result.rows.length > 0) {
            let player = result.rows[0];
            return { status: 200, result: player };
        } else {
            return { status: 404, result: { msg: "No playermatch with that id" } };
        }
    } catch (err) {
      console.log(err);
      return { status: 500, result: err };
    }    
}


module.exports.getPlayerInfo = async function (playerId) {
    try {
        let sql = `Select ply_name from player where ply_id = $1`;
        let result = await pool.query(sql, [playerId]);
        if (result.rows.length > 0) {
            let player = result.rows[0];
            return { status: 200, result: player };
        } else {
            return { status: 404, result: { msg: "No player with that id" } };
        }
    } catch (err) {
      console.log(err);
      return { status: 500, result: err };
    }
  }