import React, { Component } from 'react';
import css from '../styles.css';
import PokemonMoves from './PokemonMoves.jsx';

export default class Sprite extends Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   hoverOn: false
    // }

    // this.toggleHoverState = this.toggleHoverState.bind(this);
    // console.log(this.state);
  }

  // toggleHoverState() {
  //   this.setState({
  //     hoverOn: !this.state.hoverOn
  //   })
  //   console.log('Sprite hover state is ', this.state);
  // }

  render() {
    return (
      <div>
        <img src={this.props.sprites.front_default} alt = "" />
      </div>
    )
  }
}



    //   <div onMouseEnter={this.toggleHoverState} onMouseLeave={this.toggleHoverState}>
    //       {this.state.hoverOn === true ? <PokemonMoves /> : <img src={this.props.sprites.front_default} alt = "" /> }
    //   </div>
    // )