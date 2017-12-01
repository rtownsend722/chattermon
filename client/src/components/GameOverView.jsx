import React, { Component } from 'react';
import Pokemon from './Pokemon.jsx';
import PokemonStats from './PokemonStats.jsx';
import css from '../styles.css';

const GameOverView = (props) => {
  return (
    <div className={css.battleField}>
      <div className={css.gameOver}>
        <h1>{props.winner} wins!</h1>
        <div className={css.winnerPokeView}>
          {props.pokemon.map(poke => {
            return (
              <div key={poke.name}>
                <Pokemon sprite={poke.sprites.front_default} />
                <h5>{poke.name}</h5>
                <h5>{poke.health} / {poke.initialHealth}</h5>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GameOverView; 