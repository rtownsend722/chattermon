const Sequelize = require('sequelize');
const rgx = new RegExp(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
// const match = process.env.HEROKU_POSTGRESQL_COBALT_URL ? process.env.HEROKU_POSTGRESQL_COBALT_URL.match(rgx) : 'postgres://nbcclctopnhiug:51f82baedd1bc40dbb63284137ea0186aeed9aaca6c18c79335c3290995b196d@ec2-23-21-155-53.compute-1.amazonaws.com:5432/dcf5u7ehd5s343'.match(rgx);
const match = 'postgres://kqjhzdmigbxlqb:1a58e5a4649b4085c130ad53fecf9030663afc2e1f76509f7f66ef77784189df@ec2-54-235-210-115.compute-1.amazonaws.com:5432/demruaiple0ldm'.match(rgx);

console.log('dbname ', match[5]);
console.log('user ', match[1]);
console.log('password ', match[2]);
console.log('host ', match[3]);
console.log('port ', match[4]);

sequelize = new Sequelize(match[5], match[1], match[2], {
  dialect:  'postgres',
  protocol: 'postgres',
  port:     match[4],
  host:     match[3],
  logging: false,
  dialectOptions: {
    ssl: true
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Users = sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    email: Sequelize.STRING,
    facebookid: Sequelize.TEXT,
    avatarurl: Sequelize.TEXT,
    skinid: Sequelize.TEXT,
    usertype: Sequelize.TEXT,
    pokemons: Sequelize.ARRAY(Sequelize.TEXT),
    wins: Sequelize.INTEGER
  }, 
  {
    timestamps: false
  }
);

const Pokemon = sequelize.define('pokemon', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true
  },  
  name: Sequelize.STRING,
  types: Sequelize.ARRAY(Sequelize.TEXT),
  baseHealth: Sequelize.INTEGER,
  baseAttack: Sequelize.INTEGER,
  baseDefense: Sequelize.INTEGER,
  backSprite: Sequelize.STRING,
  frontSprite: Sequelize.STRING,

  // move: Sequelize.ARRAY(Sequelize.TEXT)
},
  {
    timestamps: false
  }
);

const Moves = sequelize.define('move', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true
  },
  type: Sequelize.TEXT,
  power: Sequelize.INTEGER,
  accuracy: Sequelize.INTEGER,
  name: Sequelize.STRING
},
  {
    timestamps: false
  }
);

Users.sync({logging: console.log});
Pokemon.sync({logging: console.log});
Moves.sync({logging: console.log, force: true});


const saveUser = (username, password, email, facebookid, avatarurl, skinid, usertype, wins) =>  {
  return Users
    .findOne({ where: { username } })
    .then(userFound => {
      if (userFound) return 'Username Already Exists';
      else return Users
        .findOne({ where: { email } })
    })
    .then(userFoundOrUsernameExists => {
      if (userFoundOrUsernameExists) {
        return userFoundOrUsernameExists === 'Username Already Exists'  ? 
        'Username Already Exists':
        'Email Already Exists';
      }
      else return Users.create({ username, password, email, facebookid:0, avatarurl:'', skinid:'', usertype:'', pokemons:[], wins:0 });
    })
};


const savePokemon = (pokemonObj) => {
  console.log('IN SAVE POKEMON!');
  Pokemon.create(pokemonObj).then((data) => {
    // console.log('DATA: ', data);
    console.log('POKEMON SAVED TO DB!')
  })
  .catch((err) => {
    console.log('POKEMON SAVED ERROR: ', err);
  });
}

const saveMove = (moveObj) => {
  console.log('In save move!');
  Move.create(moveObj).then((data) => {
    console.log('Move saved to database!');
  })
  .catch((err) => {
    console.log('Move saved error: ', err);
  });
}

const saveMove = (moveObj) => {
  console.log('In save move!');
  Move.create(moveObj).then((data) => {
    console.log('Move saved to database!');
  })
  .catch((err) => {
    console.log('Move saved error: ', err);
  });
}

// Users

//   .findAll()
//   .then(users => {
//     console.log("FOUND USERS")
//     console.log(users);
//   })



module.exports = {
  connection: sequelize,
  saveUser: saveUser,
  Users: Users,
  Pokemon: Pokemon,
  Moves: Moves
}

// POSTGRES WITHOUT SEQUELIZE
// const { Client } = require('pg');

// const client = new Client({
//   connectionString: process.env.HEROKU_POSTGRESQL_COBALT_URL || 'postgres://wairrcwaikkuob:b6f7a04b36dc888549bcedd0c99f7cec9c18eb3e83bda91f24bd31fbe60eba50@ec2-50-16-199-246.compute-1.amazonaws.com:5432/d10sjl0jdmpqhu',
//   ssl: true,
// });

// client.connect();

// client.query(`
//   CREATE TABLE USERINFO(
//     ID INT         PRIMARY KEY  NOT NULL,
//     USERNAME       CHAR(50)     NOT NULL,
//     PASSWORD       CHAR(50)     NOT NULL,
//     EMAIL          CHAR(50)     NOT NULL
//   );
//   `, (err, resp) => {
//   if (err) {
//     console.log('errored');
//     throw err;
//   }
//   // client.query(`
//   // SELECT password FROM company
//   // `, (err, resp) => {
//   //   if (err) {
//   //     console.log('errored 2');
//   //     throw err;
//   //   }
//   //   console.log('not errored');
//   //   console.log(resp);
//   // })
//   // client.query(`
//   // INSERT INTO company (ID, USERNAME, PASSWORD) VALUES (NULL, 'DAVID', 'BOWIE');
//   // `, (err, resp) => {
//   //   console.log('ADDED INTO DB');
//   //   console.log(resp)
//   //   client.end();
//   // })
// });
