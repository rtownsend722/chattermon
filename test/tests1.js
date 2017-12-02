// var request = require('request');
const app = require(__dirname + '/../server/app');
const Sequelize = require('sequelize');
const request = require('supertest');
const expect = require('chai').expect;
const db = require('../database/db.js');
const creators = require('../server/helpers/creators.js');
const gl = require('../game-logic.js');

// describe('server', function() {
//   it('should respond to GET requests', function(done) {
//     request('http://127.0.0.1:3000/', function(error, response, body) {
//       expect(response.statusCode).to.equal(200);
//       done();
//     });
//   });
// });

describe('GET /', function() {
  it('should respond with 200', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
})

xdescribe('Pokemon in the database', function() {
  it('should have the pokemon bulbasaur in the right shape.', function(done) {
    this.timeout(15000);
    db.Pokemon.findOne({name: 'bulbasaur'})
      .then((pokemon) => {
        expect(pokemon.name).to.equal('bulbasaur');
        expect(pokemon.id).to.equal(1);
        expect(pokemon.baseHealth).to.equal(45);
        expect(pokemon.baseAttack).to.equal(49);
        expect(pokemon.baseDefense).to.equal(49);
        expect(pokemon.frontSprite).to.equal('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png');
        expect(pokemon.backSprite).to.equal('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png');
        expect(pokemon.types[0]).to.equal('grass');
        expect(pokemon.types[1]).to.equal('poison');
      });
  });
})

xdescribe('An instance of a pokemon', function() {
  it('should send data back to the client in the right shape.', function(done) {
    let bulbasaur = {
      name: 'bulbasaur',
      id: 1,
      baseHealth: 45,
      baseAttack: 49,
      baseDefense: 49,
      frontSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      backSprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png'
    }
    let result = creators.createPokemon(bulbasaur);
    expect(result.name).to.equal('bulbasaur');
    expect(result.health).to.equal(45);
    expect(result.initialHealth).to.equal(45);
    expect(result.attack).to.equal(49);
    expect(result.defense).to.equal(49);
    expect(result.sprites.front_default).to.equal('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png');
    expect(result.sprites.back_default).to.equal('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png');
    done();
  })
})

describe('Log statement from a damage calculation', function() {
  it('should have the correct log statement based on type advantage.', function(done) {
    let activePlayer = {
      pokemon: [{ name: 'bulbasaur', types: ['grass', 'poison'], }]
    }
    let opponent = {
      pokemon: [{ name: 'charmander', types: ['fire'] }]
    }
    let result = gl.damageCalculation(activePlayer, opponent);
    expect(result).to.be.an('object');
    expect(result.logStatement.indexOf('It\'s not very effective...')).to.not.equal(-1);
    done();
  })
})


