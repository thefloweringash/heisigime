// -*- mode: web -*-

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Autocomplete from 'react-autocomplete';

import { words as RTKv6 } from './words';
import './app.css';

class HeisigIME extends Component {
  constructor() {
    super();

    this.state = {input:''};

    this.completed        = this.completed.bind(this);
    this.renderItem       = this.renderItem.bind(this);
    this.shouldItemRender = this.shouldItemRender.bind(this);
    this.onChange         = this.onChange.bind(this);
  }

  completed(character) {
    this.props.onInput(character);
    this.setState({input: ''});
  }

  renderItem(item, hilighted) {
    let classes = 'completion';
    if (hilighted) {
      classes += ' hilighted'
    }
    return <div className={classes}>{item[0]} {item[1]}</div>;
  }

  shouldItemRender(item, query) {
    return query !== '' && item[1].startsWith(query);
  }

  onChange(event, query) {
    this.setState({input: query});
  }

  render() {
    return (
      <Autocomplete
      wrapperProps={{className: "ime"}}
      value={this.state.input}
      onChange={this.onChange}
      onSelect={this.completed}
      renderItem={this.renderItem}
      shouldItemRender={this.shouldItemRender}
      getItemValue={([kanji, keyword]) => kanji}
      items={RTKv6}
      />
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {result: ''};

    this.characterSelected = this.characterSelected.bind(this);
  }

  characterSelected(char) {
    this.setState((prev) => ({result: prev.result + char}));
  }
  
  render() {
    return (
      <div className="app">
      <input className="result"
      value={this.state.result}
      onChange={(evt) => this.setState({result: evt.target.value})} />
      <HeisigIME onInput={this.characterSelected}/>
      </div>
    );
  }
}

function main() {
  ReactDOM.render(<App />, document.getElementById('appcontainer'));
};

main();
