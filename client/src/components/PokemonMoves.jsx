import React, { Component } from 'react';
import css from '../styles.css';

const PokemonMoves = (props) => {
  console.log('MOVES ', props.moveList);
  return (
    <div className={css.moves}>
      {props.moveList.forEach((moveObj) => {
        return <div><h5>{moveObj.name}</h5></div>
      })}
    </div>
  )
}

export default PokemonMoves;