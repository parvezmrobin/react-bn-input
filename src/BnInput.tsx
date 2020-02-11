/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Feb 12, 2020
 */

import AutoSuggest, {
  ChangeEvent,
  GetSuggestionValue, OnSuggestionsClearRequested, OnSuggestionSelected,
  RenderSuggestion,
  SuggestionsFetchRequested
} from "react-autosuggest";
import React from "react";

import AvroPhonetic from "./lib/AvroPhonetic";

type Suggestion = string;

function getSuggestions(value: string) {
  return provider.suggest(value).words;
}

const getSuggestionValue : GetSuggestionValue<Suggestion> = suggestion => suggestion;

const renderSuggestion : RenderSuggestion<Suggestion> = suggestion => (
  <span>{suggestion}</span>
);

const STORE_KEY = 'BN_INPUT';

const provider = AvroPhonetic(
  function () {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}')
  },
  function (candidates: object) {
    console.log(candidates);
    window.localStorage.setItem(STORE_KEY, JSON.stringify(candidates || {}))
  },
  function (...args: any) {
    console.log('third', args);
  }
);

class BnInput extends React.Component<{}, {value: string, input : string, suggestions: Suggestion[]}> {
  constructor(props: object) {
    super(props);

    this.state = {
      value: '',
      input: '',
      suggestions: []
    };
  }

  onChange = (event : React.FormEvent, { newValue } : ChangeEvent) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested : SuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested : OnSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelected : OnSuggestionSelected<Suggestion> = (event, {suggestionValue}) => {
    provider.commit(this.state.input, suggestionValue);
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Type 'c'",
      value,
      onChange: this.onChange
    };

    return (
      <div style={{width: '200px'}}>
        <AutoSuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps} />
      </div>
    );
  }
}

export default BnInput;
