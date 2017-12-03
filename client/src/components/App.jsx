import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './Home.jsx';
import Game from './Game.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Welcome from './Welcome.jsx';
import Scoreboard from './Scoreboard.jsx';
import io from 'socket.io-client';

const loggedIn = false;

const App = () => {
  return (
    <div>
      <Switch>
        <Route exact path='/' component={Login} />
        <Route path='/home' component={Home} />
        <Route path='/game/:gameid' component={Game} />
        <Route path='/login' component={Login} />
        <Route path='/signup' component={Signup} />
        <Route path='/welcome' component={Welcome} />
        <Route path='./scoreboard' component={Scoreboard}/>
      </Switch>
    </div>
  );
}

export default App;
