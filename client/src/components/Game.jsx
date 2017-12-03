import React, { Component } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Home from './Home.jsx';
import Login from './Login.jsx';
import Chat from './Chat.jsx';
import Terminal from './Terminal.jsx';
import GameView from './GameView.jsx';
import GameOverView from './GameOverView.jsx';
import GameForfeit from './GameForfeit.jsx';
import GameState from './GameState.jsx';
import Scoreboard from './Scoreboard.jsx';
import Logo from './Logo.jsx';
import css from '../styles.css';
import _filter from 'lodash';

import help from './../../../utils/helpers.js'

export default class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      player1: false,
      player2: false,
      messageArray: [],
      name: null,
      pokemon: [],
      opponent: null,
      isActive: null,
      attacking: false,
      gameOver: false,
      forfeited: false,
      winner: null,
      loser: null,
      chatInput: '',
      commandInput: '',
      commandArray: [{command: `The game will begin shortly - type 'help' to learn how to play`}],
      socket: null,
      opponentTyping: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleChatInputSubmit = this.handleChatInputSubmit.bind(this);
    this.handleCommands = this.handleCommands.bind(this);
    this.handleInactiveTyping = this.handleInactiveTyping.bind(this);
  }

  socketHandlers() {
    return {
      handleChat: (message) => {
        var messageInstance = {
            name: message.name,
            text: message.text
        }
        this.setState(prevState => {
          return {
            messageArray: prevState.messageArray.concat(messageInstance),
            opponentTyping: ''
          }
        })
      },
      handleTyping: () => {
        console.log('emitting initial user typing event and user is ', this.state.name);
        let context = this;

        this.state.socket.emit('user typing', {
          gameid: this.props.match.params.gameid,
          typingUser: context.state.name
        });
      },
      opponentTyping: (data) => {
        this.setState({
          opponentTyping: data.typingUser
        })
        console.log('opponent typing handler and user typing is ', this.state.opponentTyping);

        setTimeout(this.handleInactiveTyping, 3000);
      },
      endTyping: (data) => {
        this.setState({
          opponentTyping: ''
        })
      },
      playerInitialized: (data) => {
        // console.log('********* (12) player init data on Game *********', data);
        this.setState({
          [data.player]: true,
          pokemon: data.pokemon
        });
      },
      handleReady: (data) => {
        if (this.state.player1) {
          this.setState({
            isActive: true,
            opponent: data.player2
          });
        } else {
          this.setState({
            isActive: false,
            opponent: data.player1
          });
        }
        this.setState({
          commandArray: [{command: 'Let the battle begin!'}]
        });
      },
      attackProcess: (data) => {
        this.setState(prevState => {
          return {
            commandArray: prevState.commandArray.concat(data.basicAttackDialog)
          }
        });
      },
      turnMove: (data) => {
        if (this.state.player1) {
          this.setState(prevState => {
            return {
              pokemon: data.player1.pokemon,
              opponent: data.player2,
              isActive: !prevState.isActive
            }
          });
        } else {
          this.setState(prevState => {
            return {
              pokemon: data.player2.pokemon,
              opponent: data.player1,
              isActive: !prevState.isActive
            }
          })
        }
      },
      gameOver: (data) => {
        console.log('game over data: ', data);
        console.log('game over winner: ', data.name);

        this.setState({
          winner: data.name,
          gameOver: true,
          isActive: false
        }); 

        setTimeout(() => this.props.history.replace("/scoreboard"), 10000); 
      },

      forfeit: (data) => {
        console.log('forfeit data: ', data);
        console.log('forfeit winner: ', data.winner);
        console.log('forfeit loser: ', data.loser);
        this.setState({
          winner: data.winner,
          loser: data.loser,
          isActive: false,
          forfeited: true
        });

        setTimeout(() => this.props.history.replace("/scoreboard"), 10000); 
      }
    }
  }

  componentDidMount() {
    axios('/user')
      .then(({ data }) => {
        console.log('IN CDM: ', data);
        if (data.username) {
          const username = data.username;
          var socket = io();
          this.setState({
            name: username,
            socket
          })
          const playerInit = {
            gameid: this.props.match.params.gameid,
            name: username,
            pokemon: this.state.pokemon
          }

          // these are listening for events from the server
          socket.emit('join game', playerInit);
          socket.on('gamefull', message => alert(message)); 
          socket.on('chat message', this.socketHandlers().handleChat); 
          socket.on('user typing', this.socketHandlers().handleTyping);
          socket.on('show typing', this.socketHandlers().opponentTyping);
          socket.on('end typing', this.socketHandlers().endTyping);
          socket.on('player', this.socketHandlers().playerInitialized); 
          socket.on('ready', this.socketHandlers().handleReady); 
          socket.on('attack processed', this.socketHandlers().attackProcess); 
          socket.on('turn move', this.socketHandlers().turnMove);
          socket.on('gameover', this.socketHandlers().gameOver); 
          socket.on('game forfeited', this.socketHandlers().forfeit);
        }
        else {
          this.props.history.replace("/login");
        }
      })
  }

  handleInputChange(e, type) {
    // this if statement prevents the chat text area from expanding on submit (keyCode 13)
    if (e.target.value !== '\n') {
      this.setState({
        [type]: e.target.value
      });
    }
  }

  handleChatInputSubmit(e) {
    if (e.keyCode === 13) {
      var socket = io();
      this.state.socket.emit('chat message', {
        gameid: this.props.match.params.gameid, 
        name: this.state.name, 
        text: e.target.value
      });
      this.setState({
        chatInput: ''
      });
    }
  }

  handleInactiveTyping() {
    console.log('3 seconds have elapsed with no typing');
    this.state.socket.emit('inactive typing', {
        gameid: this.props.match.params.gameid, 
    });
  }

  commandHandlers() {
    return {
      help: () => {
        this.setState(prevState => {
          return {
            commandArray: prevState.commandArray.concat(help),
            commandInput: ''
          }
        })
      },
      attack: () => {
        this.state.socket.emit('attack', {
          gameid: this.props.match.params.gameid,
          name: this.state.name,
          pokemon: this.state.pokemon
        });
        this.setState({
          attacking: false
        });
      },
      attackWithMove: (move) => {
        this.state.socket.emit('attack with move', {
          gameid: this.props.match.params.gameid,
          name: this.state.name,
          pokemon: this.state.pokemon,
          move: move
        });
        this.setState({
          attacking: false
        });
      },
      choose: (pokemonToSwap) => {
        let isAvailable = false;
        let index;
        let health;
        this.state.pokemon.forEach((poke, i) => {
          if (poke.name === pokemonToSwap) {
            isAvailable = true;
            index = i;
            health = poke.health 
          }
        });
        if (isAvailable && health > 0) {
          this.state.socket.emit('switch', {
            gameid: this.props.match.params.gameid,
            pokemon: this.state.pokemon,
            index
          })
        } else if (health === 0) {
          alert('That pokemon has fainted!')
        } else {
          alert('You do not have that pokemon!');
        }
      },
      flee: () => {
        this.state.socket.emit('flee', {
          gameid: this.props.match.params.gameid,
          name: this.state.name
        });
      }
    }
  }

  handleCommands(e) {
    if (e.keyCode !== 13) return;

    let value = e.target.value.toLowerCase(); 

    if (value === 'help') {
      return this.commandHandlers().help(); 
    } 
    
    if (!this.state.isActive) {
      alert('it is not your turn!');

    } else {
      if (value === 'flee') {
        this.commandHandlers().flee();
      } else if (value === 'attack') {
        if (this.state.pokemon[0].health <= 0) {
          alert('you must choose a new pokemon, this one has fainted!');
        } else {
          //attacking state determines if front or back sprite is rendered on GameView component
          this.setState({
            attacking: true
          })
          setTimeout(() => this.commandHandlers().attack(), 300);  
        }
      } else if (value.split(' ')[0] === "choose") {
        this.commandHandlers().choose(value.split(' ')[1]); 
      } else {
        let moveArr = this.state.pokemon[0].moves;
        let moveNames = [];
        moveArr.forEach((moveObj) => {
          moveNames.push(moveObj.name);
        })
        if (moveNames.includes(value)) {
          let moveObj = moveArr.filter((move) => {
            return move.name === value;
          })

          this.setState({
            attacking: true
          })

          setTimeout(() => this.commandHandlers().attackWithMove(moveObj), 300);  
        } else {
          alert('invalid input!')
        }
      }
      this.setState({
        commandInput: ''
      });
    }
  }






    //   if (this.state.pokemon[0].moves._filter((currMove) => {return currMove.name === value}) !== undefined) {
    //     //attacking state determines if front or back sprite is rendered on GameView component
    //     this.setState({
    //       attacking: true
    //     })

    //     let move = this.state.pokemon[0].moves._filter((currMove) => {return currMove.name === value})

    //     setTimeout(() => this.commandHandlers().attackWithMove(move), 300); 
    //   } else {
    //     alert('invalid input!')
    //   }
    // }

    // this.setState({
    //   commandInput: ''
    // });
  

  renderGame() {
    const { pokemon, opponent, winner, loser, name, attacking } = this.state;
    if (!this.state.opponent) {
      return (
        <div className={css.loading}>
          <h1>Awaiting opponent...</h1>
        </div>
      )
    } else if (this.state.gameOver) {
      return <GameOverView pokemon={winner === name ? pokemon : opponent.pokemon} winner={winner} />
    } else if(this.state.forfeited) {
      return <GameForfeit winner={winner} loser={loser} pokemon={pokemon}/>
    } else {
      return <GameView opponent={opponent} pokemon={pokemon} attacking={attacking} />
    }
  }

  renderSideBar() {
    return (
      <div className={css.stateContainer}>
        <Logo name={this.state.name} isActive={this.state.isActive} opponent={this.state.opponent} />
        <GameState pokemon={this.state.pokemon} />
        <Scoreboard/>
        <Chat messageArray={this.state.messageArray} chatInput={this.state.chatInput} handleChatInputSubmit={this.handleChatInputSubmit} handleInputChange={this.handleInputChange} handleTyping={this.socketHandlers().handleTyping.bind(this)} opponentTyping={this.state.opponentTyping} /> 
      </div>
    );
  }


  render() {
    const { players, spectators, gameOver, pokemon } = this.state;
    return (
      <div className={css.gamePageContainer}>
        <div className={css.gameContainer}>
          {this.renderGame()}
          <Terminal commandArray={this.state.commandArray} commandInput={this.state.commandInput} handleCommands={this.handleCommands} handleInputChange={this.handleInputChange} />
        </div>
        {this.renderSideBar()}
      </div>
    )
  }
}

