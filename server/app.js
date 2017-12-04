const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const db = require('../database/db.js');
const bodyParser = require('body-parser');
const Promise = require('bluebird');

// const config = require('/config.js');

const bcrypt = require('bcrypt');
// const bcrypt = Promise.promisifyAll(require('bcrypt'));
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const session = require('express-session');

const axios = require('axios');
const { createPokemon, createTurnlog, createPlayer } = require('./helpers/creators.js'); 
const { damageCalculation } = require('../game-logic.js');
const { fetchMoves, checkForMoves } = require('./helpers/pokeapi.js');
const { saveMove } = require('../database/db.js');

const dist = path.join(__dirname, '/../client/dist');

/* ======================== MIDDLEWARE ======================== */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(dist));

app.use(session({ 
  secret: 'supersecret' ,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// require('./routes.js')(app, passport);

// ** Webpack middleware **
// Note: Make sure while developing that bundle.js is NOT built - delete if it is in dist directory

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const config = require('../webpack.config.js');
  const compiler = webpack(config);

  app.use(webpackHotMiddleware(compiler));
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPathdist
  }));
}

//============SESSION SETUP=============//
// Peer into passport session
// app.use(function printSession(req, res, next) {
//   console.log('req session', req.session);
//   return next();
// });

  // Determines data of user object to be stored in session
  // Looks like: req.session.passport.user = {username: 'username'}
passport.serializeUser(function(user, done) {
  done(null, user);
});

// Matches key (username) to key in session object in subsequent requests
// The fetched object is attached to the request object as req.user
passport.deserializeUser(function(user, done) {
  return db.Users.findOne({
    where : {
      id: user.id
    }
  })
  .then(foundUser => {
    console.log('in deser');
    done(null, user.id);
  })
  .catch((err) => {
    console.log('ERROR deserializing record: ', err);
  })
});

const generateHash = function(password) {
  return bcrypt.hashSync(password, 10);
}

const isValidPassword = function(providedPass, storedHash) {
  return bcrypt.compareSync(providedPass, storedHash);
}

const salt = 10;

//============LOCAL STRATEGIES=============//

//============LOCAL SIGNUP=============//

passport.use('local-signup', new LocalStrategy({
  passReqToCallback: true
},
function(req, username, password, done) {
  process.nextTick(function() {
    //fn call to find user in db
    return db.Users.findOne({
      where: {
        username: username
      }
    })
    .then(userFound => {
      if (userFound) {
        // alert('Username already exists');
        done(null, false, req.flash('signupMessage', 'This username already exists!'));
      } else {
        //may need to promisify in some weird way
        let hash = generateHash(password, salt)
        // .then(hash => {
        db.Users.create({
          username: username, 
          password: hash, 
          email:'',
          facebookid:0,
          avatarurl:'',
          skinid:'',
          usertype:'',
          pokemons:[],
          wins:0
        })
        .then(newUser => {
          console.log(newUser);
          done(null, newUser);
        })
        // })
      }
    })
    .catch(err => {
      console.log('ERROR creating record: ', err);
    })
  })
}))

//============LOCAL LOGIN=============//

passport.use('local-login', new LocalStrategy({
  passReqToCallback: true
},
function(req, username, password, done) {
  db.Users.findOne({
    where: {
      username: req.body.username
    }
  })
  .then(foundUser => {
    console.log('FOUND USER')
    if (!foundUser) {
      //FLASH
      return done(null, false, req.flash('loginMessage', 'No user found.'));
    }
    if (!isValidPassword(password, foundUser.password)) {
      //FLASH
      return done(null, false, req.flash('loginMessage', 'Incorrect password. Try again!'));
    }
    console.log('valid pw');
    return done(null, foundUser);
  })
  .catch(err => {
    console.log('ERROR verifying record: ', err);
  })
}))


//============LOCAL LOGIN=============//


passport.use(new FacebookStrategy({
  clientID: process.env.CLIENT_ID || config.facebookAuth.clientID,
  clientSecret: process.env.CLIENT_SECRET || config.facebookAuth.clientSecret,
  callbackURL: process.env.CALLBACK_URL_STAGING || process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/login/facebook/return'
},
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      // console.log('PROFILE FROM FACEBOOK: ', profile);
      return db.Users.findOrCreate({
        where: {
          username: profile.displayName.split(' ')[0],
          facebookid: profile.id,
          wins: 0
        }
      })
      .spread((user, created) => {
        console.log('User created with', user.get({plain: true}));
        done(null, user);
      })
      .catch((err) => {
        console.log('ERROR creating record: ', err);
      })
    })
  }
));

// app.post('/login', passport.authenticate('local-login', {
//   successRedirect: '/welcome',
//   failureRedirect: '/login'
// }));


app.post('/login',
  passport.authenticate('local-login', {failureRedirect: '/login', failureFlash: true}),
  function(req, resp) {
    req.session.loggedIn = true;
    resp.redirect('/welcome');
  })

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/welcome',
  failureRedirect: '/signup',
  failureFlash: true
}));

// this route redirects user to FB for auth
app.get('/login/facebook',
  passport.authenticate('facebook'));

// Theoretically, this is redirecting to /welcome which makes a request to /user
app.get('/login/facebook/return',
  passport.authenticate('facebook', {successRedirect: '/welcome',
    failureRedirect: '/login'})
  );

app.get('/user', (req, resp) => {
  console.log('in app get user');
  console.log('SESSION:',req.session);

  if (req.session.passport === undefined) {
    resp.redirect('/login');
  } else {

    resp.end(JSON.stringify({
      username: req.session.passport.user.username,
      loggedIn: req.session.loggedIn
    }));
  }

})

app.get('/logout', (req, resp) => {
  req.session.destroy(err => {
    if (err) throw err;
    resp.redirect('/login');
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}



/* =============================================================== */


/* ======================== GAME STATE =========================== */

/* The state of all games currently happening are saved in the 
'games' object.

The sample shape of a game is:

  {
    player1: object,
    player2: object,
    playerTurn: string ('player1' or 'player2')
  }

Refer to './helpers/creators.js' for more detail 
on what is inside each player object

*/

const games = {};

/* =============================================================== */ 



/* =============== SOCKET CONNECTION / LOGIC ===================== */

io.on('connection', (socket) => {
  console.log('a connection was made');
  
  /* socket.on('join game')

  The first check is to see if there is a game in the games object with this id, and if there is not, it initializes a new one with this new player.This means creating a new socket 'room' via socket.join() using the game's URL name. Once the player is created, update the game state and emit to player one ONLY that he / she is player1 by emitting directly to that socket id. 

  If the game already exists but there is no player 2, it creates that player and first emits to that client directly that it is player2 as well as to the newly created room that the game is now ready, and it sends down the game's state to both clients to parse out and render. 

  */ 

  socket.on('join game', (data) => {
    socket.join(data.gameid);
    // console.log('data: ', data);
    if (!(data.gameid in games)) {
      createPlayer(data, 'player1')
      .then(player1 => {
        //*********this is being triggered before createPlayer is complete*********
        console.log('******** (11) CREATED PLAYER WITH ********', player1);
        games[data.gameid] = {
          player1,
          player2: null,
          playerTurn: 'player1'
        }
        
        io.to(socket.id).emit('player', player1);
      });
    } else if (data.gameid in games && !games[data.gameid].player2) {
      createPlayer(data, 'player2')
      .then(player2 => {
        games[data.gameid].player2 = player2; 
        io.to(socket.id).emit('player', player2);
        io.to(data.gameid).emit('ready', games[data.gameid]);
      });
    } else {
        io.to(socket.id).emit('gamefull', 'this game is full!');
    }
  });

  socket.on('chat message', (data) => {
    // console.log('data chat message socket event is ', data);
    io.to(data.gameid).emit('chat message', data)
  });


  socket.on('flee', (data) => {
    const game = games[data.gameid];
    const player = game.playerTurn;
    const opponent = game.playerTurn === 'player1' ? 'player2' : 'player1';

    io.to(data.gameid).emit('turn move', game);     
    io.to(data.gameid).emit('game forfeited', { winner: game[opponent].name, loser: game[player].name });

    const winner = game[opponent].name;

    db.Users.findOne({
      where: {
          username: winner
        }
      })
      .then(founduser => {
        // console.log('FOUND USER: ', founduser);
        db.Users.update(
          {wins: founduser.wins + 1}, 
          {where: {username: founduser.username}}, 
        {
          fields: ['wins']
        })
        .then(updateduser => {
          // console.log('UPDATED USER ', updateduser);
        })
        .catch(error => {
        })
      });

  });

  socket.on('user typing', (data) => {
    // console.log('typing on ', data.gameid);
    
    io.to(data.gameid).emit('show typing', {
      gameid: data.gameid,
      typingUser: data.typingUser
    });
  });

  socket.on('inactive typing', (data) => {
    // console.log('REACHED inactive typing on server!!!!!!!!');
    
    io.to(data.gameid).emit('end typing', {
      gameid: data.gameid,
      typingUser: data.typingUser
    });
  });


  /* socket.on('attack') / socket.on('switch')

  These two functions both involve updating the game's state in some way and re-sending it back down to the client once it has been fully processed. Different events are emitted back to the client based on the state of the game, and can be extended to add more complexity into the game. 

  */ 

  socket.on('attack', (data) => {
    const game = games[data.gameid];
    const player = game.playerTurn;
    const opponent = game.playerTurn === 'player1' ? 'player2' : 'player1'
    const turnResults = damageCalculation(game[player], game[opponent]);
    game[opponent].pokemon[0].health -= turnResults.damageToBeDone;
    const turnlog = createTurnlog(game, turnResults, 'attack');
    io.to(data.gameid).emit('attack processed', {
      basicAttackDialog: turnlog
    })

    console.log('game opponent pokemon health:', game[opponent].pokemon[0].name, game[opponent].pokemon[0].health);
    if (
      game[opponent].pokemon[0].health <= 0 && 
      game[opponent].pokemon[1].health <= 0 && 
      game[opponent].pokemon[2].health <= 0
    ) {
      game[opponent].pokemon[0].health = 0; 
      io.to(data.gameid).emit('turn move', game);
      io.to(data.gameid).emit('gameover', { name: game[player].name });
      const winner = game[player].name;
      db.Users.findOne({
        where: {
          username: winner
        }
      })
      .then(founduser => {
        db.Users.update(
          {wins: founduser.wins + 1}, 
          {where: {username: founduser.username}}, 
        {
          fields: ['wins']
        })
        .then(updateduser => {
          console.log('UPDATED USER ', updateduser);
        })
        .catch(error => {
        })
      });

    } else if (game[opponent].pokemon[0].health <= 0) {
      game[opponent].pokemon[0].health = 0; 
      game.playerTurn = opponent;
      io.to(data.gameid).emit('turn move', game);    
    } else {
      game.playerTurn = opponent;
      io.to(data.gameid).emit('turn move', game);
    }
  });

  socket.on('attack with move', (data) => {
    const game = games[data.gameid];
    const player = game.playerTurn;
    const opponent = game.playerTurn === 'player1' ? 'player2' : 'player1';
    const move = data.move;

    const turnResults = damageCalculation(game[player], game[opponent], move);

    game[opponent].pokemon[0].health -= turnResults.damageToBeDone;
    const turnlog = createTurnlog(game, turnResults, 'attack');
    io.to(data.gameid).emit('attack processed', {
      basicAttackDialog: turnlog
    })
    if (
      game[opponent].pokemon[0].health <= 0 && 
      game[opponent].pokemon[1].health <= 0 && 
      game[opponent].pokemon[2].health <= 0
    ) {
      game[opponent].pokemon[0].health = 0; 
      io.to(data.gameid).emit('turn move', game);
      io.to(data.gameid).emit('gameover', { name: game[player].name });
      const winner = game[player].name;
      db.Users.findOne({
        where: {
          username: winner
        }
      })
      .then(founduser => {
        console.log('FOUND USER: ', founduser);
        db.Users.update(
          {wins: founduser.wins + 1}, 
          {where: {username: founduser.username}}, 
        {
          fields: ['wins']
        })
        .then(updateduser => {
          console.log('UPDATED USER ', updateduser);
        })
        .catch(error => {
        })
      });

    } else if (game[opponent].pokemon[0].health <= 0) {
      game[opponent].pokemon[0].health = 0; 
      game.playerTurn = opponent;
      io.to(data.gameid).emit('turn move', game);    
    } else {
      game.playerTurn = opponent;
      io.to(data.gameid).emit('turn move', game);
    }
  })

  socket.on('switch', (data) => {
    const game = games[data.gameid];
    const player = game.playerTurn;
    const opponent = game.playerTurn === 'player1' ? 'player2' : 'player1';
    game[player].pokemon.unshift(game[player].pokemon.splice(data.index, 1)[0]);
    const turnlog = createTurnlog(game, null, 'switch');
    game.playerTurn = opponent;
    io.to(data.gameid).emit('attack processed', {
      basicAttackDialog: turnlog
    });
    io.to(data.gameid).emit('turn move', game);
  })

});

/* =============================================================== */

/* =============== MISCELLANEOUS ROUTES / LOGIC ================= */

app.get('/scores', (req, resp) => {
  console.log('fetching scores');
  db.Users.findAll({
    order: [
      ['wins', 'DESC']
    ],
    limit: 10
  })
  .then(foundusers => {
    console.log('found');
    resp.status(200).send(foundusers);
  })
}) 





// a catch-all route for BrowserRouter - enables direct linking to this point.

app.get('/*', (req, resp) => {
    resp.sendFile(dist + '/index.html');
});


var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('listening on *:' + port);
});

module.exports = app;
