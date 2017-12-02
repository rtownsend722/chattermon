import React, { Component } from 'react';
import Sprite from './Sprite.jsx';
import css from '../styles.css';

const PokemonCard = (props) => {
  return (
    <div>
      <Sprite pic={props.sprites.front_default} />
      <h5 style={{marginBottom: '0px', marginTop: '2px'}}>{props.name}</h5>
      <h6 style={{marginBottom: '0px'}}>{props.health} / {props.initialHealth}</h6>
    </div>
  )
}

export default PokemonCard;


// import React, { Component } from 'react';

// class HoverExample extends Component {
//   constructor(props) {
//     super(props);
//     this.handleMouseHover = this.handleMouseHover.bind(this);
//     this.state = {
//       isHovering: false,
//     };
//   }

//   handleMouseHover() {
//     this.setState(this.toggleHoverState);
//   }

//   toggleHoverState(state) {
//     return {
//       isHovering: !state.isHovering,
//     };
//   }

//   render() {
//     return (
//       <div>
//         <div
//           onMouseEnter={this.handleMouseHover}
//           onMouseLeave={this.handleMouseHover}
//         >
//           Hover Me
//         </div>
//         {
//           this.state.isHovering &&
//           <div>
//             Hovering right meow! 🐱
//           </div>
//         }
//       </div>
//     );