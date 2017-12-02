import React, { Component } from 'react';
import css from '../styles.css';

const Sprite = (props) => {
  return (
    <div>
      <img src={props.pic} alt="" />
    </div>
  )
}

export default Sprite;