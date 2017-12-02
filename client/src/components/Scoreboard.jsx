import React, {Component} from 'react';
import axios from 'axios';
import css from '../styles.css';

export default class Scoreboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scores: []
    };
  }

  componentDidMount() {
    console.log('loading scores');
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

  render() {
    return (
      <div className={css.highScoresContainer}>
        <div className={css.highScoresTitle}>High Scores</div>
        {this.state.scores.map((record, index) => (
          <div className={css.highScore} key={index}>
              <div className={css.highScoreEntryName}>{record.username.slice(0,3).toUpperCase()}</div>
              <div className={css.highScoreEntry}>{record.wins}</div>
          </div>
        ))}
      </div>
    );
  }

}