/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Feb 12, 2020
 */

import AutoSuggest, {
  ChangeEvent,
  GetSuggestionValue,
  RenderSuggestion,
  SuggestionsFetchRequested
} from "react-autosuggest";
import React from "react";

type Suggestion = {
  name: string,
  year: number,
}

const languages = [
  {
    name: 'C',
    year: 1972
  },
  {
    name: 'C#',
    year: 2000
  },
  {
    name: 'C++',
    year: 1983
  },
  {
    name: 'Clojure',
    year: 2007
  },
  {
    name: 'Elm',
    year: 2012
  },
  {
    name: 'Go',
    year: 2009
  },
  {
    name: 'Haskell',
    year: 1990
  },
  {
    name: 'Java',
    year: 1995
  },
  {
    name: 'Javascript',
    year: 1995
  },
  {
    name: 'Perl',
    year: 1987
  },
  {
    name: 'PHP',
    year: 1995
  },
  {
    name: 'Python',
    year: 1991
  },
  {
    name: 'Ruby',
    year: 1995
  },
  {
    name: 'Scala',
    year: 2003
  }
];

function escapeRegexCharacters(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value: string) {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return languages.filter(language => regex.test(language.name));
}

const getSuggestionValue : GetSuggestionValue<Suggestion> = suggestion => suggestion.name;

const renderSuggestion : RenderSuggestion<Suggestion> = suggestion => (
  <span>{suggestion.name}</span>
);

class BnInput extends React.Component<{}, {value: string, suggestions: Suggestion[]}> {
  constructor(props: object) {
    super(props);

    this.state = {
      value: '',
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

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
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
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps} />
      </div>
    );
  }
}

export default BnInput;
