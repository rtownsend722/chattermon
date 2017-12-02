import React, { Component } from 'react';
import Sprite from './Sprite.jsx';
import PokemonMoves from './PokemonMoves.jsx';
import css from '../styles.css';

export default class PokemonCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderSprite: true
    }

    this.toggleHoverState = this.toggleHoverState.bind(this);
  }

  toggleHoverState() {
    this.setState({
      renderSprite: !this.state.renderSprite
    })
    console.log('sprite state is ', this.state);
  }

  render() {
    return (
      <div onMouseEnter={this.toggleHoverState} onMouseLeave={this.toggleHoverState}>
        {this.state.renderSprite ? <Sprite sprites={this.props.sprites} /> : <PokemonMoves /> }
        <h5 style={{marginBottom: '0px', marginTop: '2px'}}>{this.props.name}</h5>
        <h6 style={{marginBottom: '0px'}}>{this.props.health} / {this.props.initialHealth}</h6>
      </div>
    )
  }
}