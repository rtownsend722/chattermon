// Chat.jsx
// Chat is where a user enters chat messages so they can converse with their opponent
// Chat receives a messageArray (array) as a prop, as well as references to a chatInput string, handleChatInputSubmit function and handleChatInputChange function
// Chat maps to the messageArray to render each messages
// the other three props determine what has been typed into the field so it can be rendered and used later, as well as a submit listener
// Chat is setup not to scroll with new messages if you are not scrolled to the bottom already
// This allows a user to read old messages
// componentWillReceiveProps (aka when a new message is coming in), the user's scroll position is determined
  // It also determines if the new message banner should appear (only when the user isn't scrolled to the bottom)
// componentDidUpdate does the actual scrolling if it's been determined the div should scroll with the new message
// TextareaAutosize is a 3rd party component that's been configured and styled to look like an input field but expand in height as the user types
  // Styles are not perfect, but for most cases it expands as wanted

import React, { Component } from 'react';
import css from '../styles.css';
import TextareaAutosize from "react-textarea-autosize";

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldScroll: true,
      showNewMessageBanner: false,
      userTyping: '',
      showTypingBanner: false
    };

    this.handleChatInputSubmit = this.handleChatInputSubmit.bind(this);
    // this.handleNewUserTyping = this.handleNewUserTyping.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.messageArray.length !== this.props.messageArray.length) {
      let messageContainer = document.getElementsByClassName(css.messageContainer)[0];
      if (messageContainer.clientHeight + messageContainer.scrollTop === messageContainer.scrollHeight) {
        // User is scrolled to the bottom of messages, so do autoscroll
        this.setState({
          shouldScroll: true,
          showNewMessageBanner: false
        });
      } else {
        // User is reading old messages above the scroll, so do NOT autoscroll
        this.setState({
          shouldScroll: false,
          showNewMessageBanner: true
        });
        setTimeout(function() {
          this.setState({showNewMessageBanner: false});
        }.bind(this), 2000);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // check to see if there are new messages incoming
      // if there are new messages, and the user is at the bottom of the message log scroll
        // then scroll down to show the message
    if (prevProps.messageArray.length !== this.props.messageArray.length) {
      let messageContainer = document.getElementsByClassName(css.messageContainer)[0];
      if (this.state.shouldScroll) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }

      // this.setState({
      //   showTypingBanner: !this.state.showTypingBanner
      // })

      //one a new messages comes in, trigger handler on game component
        //to update state of opponent typing to '' and remove banner
    }

    // check to see if prop indicating which person is typing has changed
      //if so, invoke handleUserTyping with value of user typing
    if (prevProps.opponentTyping !== this.props.opponentTyping) {
      console.log('user typing is ', this.props.opponentTyping);
      //if the opponent typing is blank (triggered by enter or inactivity)
      if (this.props.opponentTyping === '') {
        //change state and do not show the banner
        this.setState({
          userTyping: '',
          showTypingBanner: false
        })
      } else {
        //change the state to the correct user, keep banner up
        this.setState({
          userTyping: this.props.opponentTyping,
          showTypingBanner: true
        })
      // }
      // this.handleNewUserTyping(this.props.opponentTyping);
    }
  }
  }

  throttle(func, ms) {
    let canRun = true;
    return () => {
      if (canRun) {
        canRun = false;
        setTimeout(() => {canRun=true;}, ms);
        return func.apply(this, arguments)
      }

      return null;
    }
  }

  handleChatInputSubmit (e) {
    if (e.keyCode === 13) {
      let messageContainer = document.getElementsByClassName(css.messageContainer)[0];
      // this.setState({
      //   userTyping: '',
      //   showTypingBanner: false
      // })
      this.props.handleChatInputSubmit(e);
      messageContainer.scrollTop = messageContainer.scrollHeight;
    } else {
    //   this.throttle(this.props.handleTyping, 1000);
    //   // this.props.handleTyping();
    // }

      this.props.handleTyping();
    }
  }

  // update state with new value of user typing
  // handleNewUserTyping(userTyping){
  //   console.log('user typing is ', userTyping);
  //   this.setState({
  //     userTyping: userTyping
  //   })
  // }

  render() {
    return (
      <div className={css.chatContainer}>
        <div className={css.messageContainer}>
          {this.props.messageArray.map((message, i) => {
            return (
              <div className={css.messageInstance} key={i}>
                <div className={css.messageUsername}>{message.name}</div>
                <div className={css.messageText}>{message.text}</div>
              </div>
            );
          })}
        </div>
        <div className={css.messageInputContainer}>
          {/* for future styling: https://alistapart.com/article/expanding-text-areas-made-elegant */}
          <div className={css.newMessageAlertBanner} style={{display: this.state.showNewMessageBanner ? 'block' : 'none' }}>New Message</div>
          <TextareaAutosize className={css.messageInput} value={this.props.chatInput} placeholder="gotta chat em all..." onKeyDown={this.handleChatInputSubmit} onChange={(e) => this.props.handleInputChange(e, 'chatInput')} />
          {this.state.showTypingBanner && <img className={css.userTypingImg} src="https://www.washingtonpost.com/graphics/entertainment/norm-macdonald/img/typing.gif"/>}
          <div className={css.userTypingContainer} style={{display: this.state.showTypingBanner ? 'block': 'none'}}>{this.state.userTyping}</div>
        </div>
      </div>
    )
  }
}

 // {this.state.showTypingBanner && <img className='http://www.slate.com/content/dam/slate/blogs/browbeat/2011/09/29/hugo_chavez_caption_co
