import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import css from '../styles.css';
import axios from 'axios';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      registered: undefined,
      usernameError: false,
      passwordError: false
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    axios('/user')
    .then(({ data }) => {
      if (data.username) {
        const username = data.username;
        this.setState({
          name: username
        });
        this.props.history.replace("/welcome");
      }
    });
  }

  handleUsernameChange(e) {
    console.log('Username changed to', e.target.value);

    this.setState({
      username: e.target.value
    });
  }

  handlePasswordChange(e) {
    console.log('Password changed to', e.target.value);

    this.setState({
      password: e.target.value
    });
  }

  handleSubmit() {
    console.log('click\'d');
    const username = this.state.username;
    const password = this.state.password;
    axios({
        method: 'post',
        url: '/login',
        baseUrl: process.env.baseURL || 'http://localhost:3000',
        data: { username, password }
      })
      .then(resp => {
        console.log(resp);
        console.log("user found");
        this.setState({
          registered: true
        });
      })
  }

  render() {
    if (this.state.registered === false) {
      return (
        <Redirect to="/signup"/>
      )
    }
    else if (this.state.registered === true) {
      return (
        <Redirect to="/welcome"/>
      )
    }
    else {
      let usernameField = null;
      let passwordField = null;

      if (this.state.usernameError) {
        usernameField = <div className={css.fieldErrorWrapper}>
          <div className={css.fieldErrorText}>Username does not exist</div>
          <input type="text" className={css.fieldErrorInput} placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange}></input>
        </div>
      } else {
        usernameField = <input type="text" className={css.signInUpField} placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange}></input>
      }

      if (this.state.passwordError) {
        passwordField = <div className={css.fieldErrorWrapper}>
          <div className={css.fieldErrorText}>Password is incorrect</div>
          <input type="password" className={css.fieldErrorInput} placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange}></input>
        </div>
      } else {
        passwordField = <input type="password" className={css.signInUpField} placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange}></input>
      }

      return (
        <div>
          <div className={css.navBar}>
            <div className={css.logo}>Chattermon</div>
            <div className={css.navBarLinksContainer}>
              <div className={css.navBarLink}><Link to={'/signup'} className={css.navBarLinkA}>Sign Up</Link></div>
            </div>
          </div>

          <div className={css.contentSuperWrapper}>
            <div className={css.welcomeControlPannel}>
              <div className={css.welcomeMessage}>Welcome Back</div>
              <div className={css.controlsContainer}>
                <div className={css.joinGameContainer}>
                  {/* <input type="text" className={css.signInUpField} placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange}></input>
                  <input type="password" className={css.signInUpField} placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange}></input> */}
                  {usernameField}
                  {passwordField}
                  <button className={css.gameButton} onClick={this.handleSubmit}>Login</button>
                </div>
                <div className={css.seperator}></div>
                <div className={css.altAuthText}>New here?</div>
                <Link to='/signup' className={css.gameButtonLink}><button className={css.gameButton}>Sign up</button></Link>

                <div className={css.seperator}></div>
                <div className={css.altAuthText}>Log in with Facebook</div>
                <button className={css.gameButton}><a href="/login/facebook">Facebook</a></button>
              </div>
              
            </div>
          </div>
        </div>
      )
    }
  }
}
