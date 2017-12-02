// Welcome.jsx
// Home screen for logged in user that creates new session or joins existing
// On componentDidMount, a potentiall newGameId is created for linking to. Going to an unused gameId url will start a new game
// handleRoomInputReturn sees if you hit enter on the join game field to take you there, but it doesn't actually work... but maybe you can fix it!
// handleRoomInputChange keeps track of what is in the input field
// The join game button is setup to swap based on your input in the join field. If nothing is in the join field, well nothing is going to happen

import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import css from '../styles.css';
import axios from 'axios';

export default class Welcome extends Component {
  constructor(props) {
    super (props);
    this.state = {
      newGameId: '',
      roomInput: '',
      name: 'PokéMaster'
    }
    this.handleRoomInputReturn = this.handleRoomInputReturn.bind(this);
    this.handleRoomInputChange = this.handleRoomInputChange.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    function makeGameId() {
      var newGameId = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      for (var i = 0; i < 5; i++)
        newGameId += possible.charAt(Math.floor(Math.random() * possible.length));
      return newGameId;
    }

    this.setState({
      newGameId: makeGameId()
    });

    // 
    axios('/user')
    .then(({ data }) => {
      console.log('in axios user call with data: ', data);
      if (data.username) {
        const username = data.username;
        this.setState({
          name: username
        });
      } else {
        this.props.history.replace("/login");
      }
    });
  }

  handleRoomInputReturn(e) {
    if (e.keyCode === 13) {
      console.log('This should be sending you to the proper room, but I dont know how without Redirect, which I dont want to use as it elimates history');
      console.log('So use the button instead');
    }
  }

  handleRoomInputChange(e) {
    this.setState({
      roomInput: e.target.value.toUpperCase()
    });
  }

  handleLogout() {
    console.log('handle logout');
    axios('/logout');
  }

  render() {
    let joinGameButton = null
    if (this.state.roomInput.length) {
      joinGameButton = <Link to={'game/' + this.state.roomInput} className={css.gameButtonLink}><button className={css.gameButton}>Join Game</button></Link>
    } else {
      joinGameButton = <button className={css.gameButton} onClick={() => {alert('You need to enter a Room ID')}}>Join Game</button>
    }

    return (
      <div>
        <div className={css.navBar}>
          <div className={css.logo}>Chattermon</div>
          <div className={css.navBarLinksContainer}>
            
          <div className={css.navBarLink} ><a className={css.navBarLinkA} href='/logout'>Logout</a></div>

          </div>
        </div>
        <div className={css.contentSuperWrapper}>
          <div className={css.welcomeControlPannel}>
            <div className={css.welcomeMessage}>Welcome back {this.state.name}</div>
            <div className={css.controlsContainer}>
              <Link to={'game/' + this.state.newGameId} className={css.gameButtonLink}><button className={css.gameButton}>New Game</button></Link>
              <div className={css.seperator}></div>
              <div className={css.joinGameContainer}>
                <input className={css.roomIdField} placeholder="Room ID" value={this.state.roomInput} onKeyDown={this.handleRoomInputReturn} onChange={this.handleRoomInputChange}></input>
                {joinGameButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
