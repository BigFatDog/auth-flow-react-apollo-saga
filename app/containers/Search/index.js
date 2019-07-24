import React, { useEffect, useState } from 'react';
import deburr from 'lodash/deburr';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/core/styles';
import { fromEvent, from } from 'rxjs';
import {
  map,
  filter,
  distinctUntilChanged,
  debounceTime,
  switchMap,
} from 'rxjs/operators';

import { get, post } from '../../core/http/post';

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input,
        },
      }}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.completion, query);
  const parts = parse(suggestion.completion, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map(part => (
          <span
            key={part.text}
            style={{ fontWeight: part.highlight ? 500 : 400 }}
          >
            {part.text}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

const getSuggestions = async value => {
  const prefix = deburr(value.trim()).toLowerCase();
  const inputLength = prefix.length;

  if (inputLength === 0) {
    return [];
  }

  const suggestions = await get(
    `/api/completions/get?prefix=${prefix}&limit=10&scores=true`
  );
  return suggestions.data;
};

function getSuggestionValue(suggestion) {
  return suggestion.completion;
}

const useStyles = makeStyles(theme => ({
  root: {
    height: 250,
    flexGrow: 1,
  },
  container: {
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  divider: {
    height: theme.spacing(2),
  },
}));

export default function IntegrationAutosuggest() {
  const classes = useStyles();
  const [stateSuggestions, setSuggestions] = React.useState([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    let searchBox = document.getElementById('search');
    let results = document.getElementById('results');
    let searchGithub = query =>
      fetch(`https://api.github.com/search/users?q=${query}`).then(data =>
        data.json()
      );

    let input$ = fromEvent(searchBox, 'input').pipe(
      map(e => e.target.value),
      debounceTime(250),
      filter(query => query.length >= 2 || query.length === 0),
      distinctUntilChanged(),
      switchMap(value =>
        value ? from(searchGithub(value)) : from(Promise.resolve({ items: [] }))
      )
    );

    input$.subscribe(data => {
      while (results.firstChild) {
        results.removeChild(results.firstChild);
      }
      data.items.map(user => {
        let newResult = document.createElement('li');
        newResult.textContent = user.login;
        results.appendChild(newResult);
      });
    });
  }, []);

  const handleSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions(value);
    setSuggestions(suggestions);
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) => {
    post('/api/completion/increment', { completion: suggestionValue });
  };

  const autosuggestProps = {
    renderInputComponent,
    suggestions: stateSuggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
    onSuggestionSelected,
  };

  return (
    <div className={classes.root}>
      <Autosuggest
        {...autosuggestProps}
        inputProps={{
          classes,
          id: 'react-autosuggest-simple',
          label: 'Country',
          placeholder: 'Search a country (start with a)',
          value,
          onChange: (evt, { newValue} ) => setValue(newValue),
        }}
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion,
        }}
        renderSuggestionsContainer={options => (
          <Paper {...options.containerProps} square>
            {options.children}
          </Paper>
        )}
      />
      <div className={classes.divider} />
      <input type="text" name="search" id="search" />

      <ul id="results"></ul>
    </div>
  );
}
