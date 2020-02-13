/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Feb 12, 2020
 */

import AutoSuggest, {
  ChangeEvent,
  GetSuggestionValue, InputProps, OnSuggestionsClearRequested, OnSuggestionSelected, RenderInputComponent,
  RenderSuggestion,
  SuggestionsFetchRequested
} from "react-autosuggest";
import React, {DetailedHTMLProps, FormEvent, InputHTMLAttributes, ReactHTML, RefObject} from "react";

import AvroPhonetic from "./lib/AvroPhonetic";

/**
 * stores selections in `localStorage` with following key
 */
const {STORE_KEY = 'BN_INPUT'} = process.env;

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
  let index;
  for (index = sentence.length - 1; index >= 0; index--) {
    if (sentence[index].match(nonCharRegEx)) {
      return {head: sentence.substring(0, index + 1), tail: sentence.substring(index + 1)};
    }
  }
  return {tail: sentence};
};

const getSuggestionValue: GetSuggestionValue<Suggestion> = suggestion => suggestion;

const renderSuggestion: RenderSuggestion<Suggestion> = suggestion => (
  <span>{suggestion}</span>
);

const getSuggestions = (value: string): Suggestion[] => provider.suggest(value).words;

type BnInputProps = {
  autofocus?: boolean,
  inputEl?: keyof ReactHTML,
};
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

    // translate last english word if a special char is pressed
    if (
      // a new special char is typed and last char of `head` is that special-char
      !tail
      // `head` has at least two char which is possibly a word-char followed by the pressed special-char
      && head && head.length > 1
      // second last char in `head` is a word-char
      && !nonCharRegEx.test(head[head.length - 2])
      // also `head` has to be lengthier than `state.value` to ensure that the change is not cause by backspace
      && head.length > this.state.value.length
    ) {
      const typedSentence = head.substr(0, head.length - 1);
      const specialChar = head[head.length - 1];
      const {head: alreadyTranslated = ''} = split(typedSentence);
      const highlightedSuggestion = this.state.highlightedSuggestion;
      if (highlightedSuggestion) {
        // if user highlighted a suggestion, then commit it for future reference as well as use now
        provider.commit(this.state.input, highlightedSuggestion);
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

    const suggestions = tail ? getSuggestions(tail): [];
    this.setState({
      value,
      input: tail,
      suggestions: suggestions,
    });

    if (tail) {
      // if user previously selected / highlighted a suggestion for this input
      // by default highlight this
      const candidate = provider.candidate(tail);
      if (candidate) {
        this.state.ref.current?.setState({
          highlightedSuggestionIndex: suggestions.indexOf(candidate),
          highlightedSuggestion: candidate,
        });
      }
    }
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

  renderInputComponent: RenderInputComponent<Suggestion> = (inputProps: InputProps<Suggestion>) => {
    const props = inputProps as DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    const {inputEl = 'input'} = this.props;
    if (inputEl) {
      return React.createElement(inputEl, props);
    }
  };

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
          renderInputComponent={this.renderInputComponent}
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
