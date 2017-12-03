import React, {Component} from 'react';
import axios from 'axios';
import css from '../styles.css';

export default class Scoreboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scores: []
    };

    this.handleEnterPress = this.handleEnterPress.bind(this);
  }

  componentDidMount() {
    console.log('loading scores');

    document.addEventListener('keydown', this.handleEnterPress, false);

    axios.get('/scores')
    .then(response => {
      console.log(response);
      this.setState({
        scores: response.data
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  handleEnterPress(e) {
    console.log('i am here');
    var code = e.keyCode;
    if (code === 13) {
      this.props.history.replace('/welcome');
    }
  }

  render() {
    return (
      <div>
        <input onKeyPress={this.handleEnterPress.bind(this)}/>

        <div className={css.highScoresContainer}>
          <div className={css.highScoresTitle}>High Scores</div>
          <div className={css.highScoresTextContainer}>
            {this.state.scores.map((record, index) => (
              <div className={css.highScore} key={index}>
                  <div className={css.highScoreEntryName}>{record.username.slice(0,3).toUpperCase()}</div>
                  <div className={css.highScoreEntry}>{record.wins}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={css.hsNewGameContainer}>
          <div className={css.hsNewGameText}>Press enter to play again</div>
        </div>




      </div>
    );
  }

}