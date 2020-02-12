/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Feb 12, 2020
 */

import AutoSuggest, {
  ChangeEvent,
  GetSuggestionValue, InputProps, OnSuggestionsClearRequested, OnSuggestionSelected,
  RenderSuggestion,
  SuggestionsFetchRequested
} from "react-autosuggest";
import React, {FormEvent, RefObject} from "react";

import AvroPhonetic from "./lib/AvroPhonetic";

/**
 * stores selections in `localStorage` with following key
 */
const STORE_KEY = 'BN_INPUT';

/**
 * Provides phonetic translation
 */
const provider = AvroPhonetic(
  // gets previous selections from `localStorage`
  function () {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}')
  },
  // stores user's selections in `localStorage`
  function (candidates: object) {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(candidates || {}))
  },
  // could not retrieve what this param does as the source code is minified
  function (...args: any) {
    console.log('third', args);
  }
);

type Suggestion = string;

const nonCharRegEx = /[!@#$%&*(),?":{}|<>\s]/g;

const split = (sentence: Suggestion): { head?: string, tail: string } => {
  const matches = Array.from(sentence.matchAll(nonCharRegEx));
  if (!matches.length) {
    return {tail: sentence};
  }
  const lastIndex = matches[matches.length - 1].index as number;
  return {head: sentence.substring(0, lastIndex + 1), tail: sentence.substring(lastIndex + 1)};
};

const getSuggestionValue: GetSuggestionValue<Suggestion> = suggestion => suggestion;

const renderSuggestion: RenderSuggestion<Suggestion> = suggestion => (
  <span>{suggestion}</span>
);

function getSuggestions(value: string): Suggestion[] {
  return provider.suggest(value).words;
}

type BnInputProps = { autofocus?: boolean };
type BnInputState = {
  value: string,
  input: string,
  suggestions: Suggestion[],
  highlightedSuggestion: Suggestion,
  ref: RefObject<AutoSuggest>,
};

class BnInput extends React.Component<BnInputProps, BnInputState> {
  constructor(props: Readonly<BnInputProps>) {
    super(props);

    this.state = {
      value: '',
      input: '',
      highlightedSuggestion: '',
      suggestions: [],
      ref: React.createRef<AutoSuggest>(),
    };
  }

  onChange = (event: FormEvent, {newValue, method}: ChangeEvent) => {
    if (method === 'type') {
      this.setState({value: newValue, highlightedSuggestion: ''});
    } else if (['down', 'up'].includes(method)) {
      this.setState({highlightedSuggestion: newValue})
    }
  };

  onSuggestionsFetchRequested: SuggestionsFetchRequested = ({value}) => {
    const {head, tail} = split(value);
    if (!tail) { // a new special char is typed
      if (head && head.length > 1) { // `head` has at least two char which is possibly a word-char and a special-char
        if (!nonCharRegEx.test(head[head.length - 2])) { // second last char in `head` is a word-char
          const typedSentence = head.substr(0, head.length - 1);
          const specialChar = head[head.length - 1];
          const {head: alreadyTranslated = ''} = split(typedSentence);
          const highlightedSuggestion = this.state.highlightedSuggestion;
          if (highlightedSuggestion) {
            this.setState({
              value: alreadyTranslated + highlightedSuggestion + specialChar,
              input: '',
              suggestions: [],
            });

            return;
          }

          const suggestion = this.state.suggestions;
          if (suggestion.length) {
            const firstSuggestion = suggestion[0];
            this.setState({
              value: alreadyTranslated + firstSuggestion + specialChar,
              input: '',
              highlightedSuggestion: '',
              suggestions: [],
            });

            return;
          }
        }
      }
    }
    this.setState({
      value,
      input: tail,
      suggestions: getSuggestions(tail)
    });
  };

  onSuggestionsClearRequested: OnSuggestionsClearRequested = () => {
    this.setState({
      input: '',
      suggestions: []
    });
  };

  onSuggestionSelected: OnSuggestionSelected<Suggestion> = (event, {suggestionValue}) => {
    this.setState(state => {
      const {head = ''} = split(state.value);
      return {
        value: head + suggestionValue,
        input: '',
      };
    });
    provider.commit(this.state.input, suggestionValue);
  };

  componentDidMount() {
    if (this.props.autofocus) {
      this.state.ref.current?.input?.focus();
    }
  }

  render() {
    const {value, suggestions, ref} = this.state;
    const inputProps: InputProps<Suggestion> = {
      value: value,
      onChange: this.onChange,
    };

    return (
      <div style={{width: '200px'}}>
        <AutoSuggest
          ref={ref}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}/>
      </div>
    );
  }
}

export default BnInput;
