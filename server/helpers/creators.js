const db = require('../../database/db.js');


/*

====== Game Creation Helpers ========

These functions help shape the data that ultimately build up the state of each
game. They return correctly parsed data that the client will eventually be expecting, 
which will be emitted from the socket connection within server/app.js 

*/


const createPokemon = (pokemon) => {
  // console.log('(3) ********* reached create pokemon with 1st pokemon as ******', pokemon);
  let { name, baseHealth, baseAttack, baseDefense, frontSprite, backSprite, types } = pokemon;

  return new Promise((resolve, reject) => {
    createMoves(types)
    .then((moves) => {
        // console.log('************************ (6) BEFORE POKE TO ADD*****************');

          var random = (factor) => {
            return Math.ceil(Math.random() * factor)
          }

          totalMoveNumber = moves.length < 4 ? moves.length : 4;
          var finalMoves = [];
          
          for(var i = 0; i < totalMoveNumber; i++){
            var newMove = moves[random(moves.length - 1)];
            if(!finalMoves.includes(newMove)) {
              finalMoves.push(newMove);  
            }
          }

          let { name, baseHealth, baseAttack, baseDefense, frontSprite, backSprite, types } = pokemon;

          var pokeToAdd = {
            name,
            health: baseHealth,
            initialHealth: baseHealth,
            attack: baseAttack,
            defense: baseDefense,
            sprites: {front_default: frontSprite, back_default: backSprite},
            types,
            moves: finalMoves
          }

          // console.log('(7) ********* created pokemon with moves as ******', pokeToAdd);

          resolve(pokeToAdd);
    })
  })
}

const createMoves = (types) => {
  console.log('(4) ********* reached create moves ******');
  let primaryType = types[0] === 'fairy' ? 'normal' : types[0];

    return new Promise((resolve, reject) => {
      db.Move.findAll({
        where: {
          type: primaryType
        }
      })
      .then(movesToAdd => {
        // console.log('(5) ********* found moves of that type from the db with ******', movesToAdd);
        let output = [];
        
        movesToAdd.forEach((moveObj) => {
          // console.log('MOVED OBJ DV', moveObj.dataValues);
          output.push(moveObj.dataValues);
        })

        resolve(output);
      })
      .catch(err => reject(err)); 
    })
}

const createPlayer = (player, number) => {
  // console.log('(1) ********* reached create player ******');
  const random = () => {
    return Math.ceil(Math.random() * 150)
  }
  return new Promise((resolve, reject) => {
    let pokemonCalls = [];
    for (let i=0; i < 3; i++) {
      pokemonCalls.push(db.Pokemon.findOne({ where: { id: random() } }))
    }
    Promise.all(pokemonCalls)
    .then(results => {
      // console.log('(2) ********* fetched 3 pokemon with ******', pokemonCalls);
      let pokemon = []
      results.forEach(result => {
        pokemon.push(createPokemon(result))
          // console.log('(8) **************POKEMON ARR IS**********', pokemon);
      })

      Promise.all(pokemon)
      .then((pokemon) => {
        // console.log('(9) ********* new pokemon with moves array is now ******', pokemon);
      
        let userCreated = {
            player: number,
            name: player.name,
            pokemon
        }

        // console.log('(10) ********* new user with pokemon is now ******', userCreated);
        resolve(userCreated);
      })
    })
  })
}

const createTurnlog = (game, turn, type) => {
  const player = game.playerTurn;
  const opponent = game.playerTurn === 'player1' ? 'player2' : 'player1'
  if (type === 'attack') {
    if (turn.damageToBeDone === 0) {
      let turnlog = [{command: `${game[player].pokemon[0].name} missed!`}];
      turnlog.push({command: `${game[opponent].pokemon[0].name} lost ${turn.damageToBeDone} HP`});

      if (game[opponent].pokemon[0].health <= 0) {
        turnlog.push({command: `${game[opponent].pokemon[0].name} has fainted!`}); 
      }
      console
      return turnlog;
    } else {
      let turnlog = [{command: `${game[player].pokemon[0].name} attacked!`}];
      turn.logStatement !== '' ? turnlog.push({command: turn.logStatement}) : null;
      //ensure a pokemon cannot lose more HP than it currently has
      // console.log('1st damage ', turn.damageToBeDone) 
      // if (turn.damageToBeDone > game[opponent].pokemon[0].health) {
      //   turn.damageToBeDone = game[opponent].pokemon[0].health;
      // }
      // console.log('AMENDED damage ', turn.damageToBeDone) 
      turnlog.push({command: `${game[opponent].pokemon[0].name} lost ${turn.damageToBeDone} HP`});

      if (game[opponent].pokemon[0].health <= 0) {
        turnlog.push({command: `${game[opponent].pokemon[0].name} has fainted!`}); 
      }

      return turnlog;
    }
  } else if (type === 'switch') {
    let turnlog = [{command: `${game[player].pokemon[0].name} appears!`}];
    return turnlog; 
  }
}

module.exports = {
  createPokemon,
  createPlayer,
  createTurnlog
}










