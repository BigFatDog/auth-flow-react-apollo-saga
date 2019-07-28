import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import HistoryIcon from '@material-ui/icons/History';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import DirectionsIcon from '@material-ui/icons/Directions';
import { fromEvent, from } from 'rxjs';
import {
  map,
  filter,
  distinctUntilChanged,
  debounceTime,
  switchMap,
} from 'rxjs/operators';

import { get, post } from '../../core/http/post';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  searchContainer: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 600,
  },
  resultContainer: {
    alignItems: 'center',
    width: 600,
  },

  suggestionItem: {
    borderBottom: '1px #AAAAAA solid',
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4,
  },
}));

const Search = props => {
  const classes = useStyles();
  const searchRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);

  // useEffect(() => {
  //   get('/api/completions/dump')
  // }, [])

  useEffect(() => {
    if (searchRef !== null) {
      const searchBox = document.getElementById('search');
      const searchBackend = prefix =>
        get(`/api/completions/get?prefix=${prefix}&limit=10&scores=true`).then(
          res => res.data
        );

      const input$ = fromEvent(searchBox, 'input').pipe(
        map(e => e.target.value),
        debounceTime(250),
        filter(
          query =>
            (query.length >= 1 && query.length <= 10) || query.length === 0
        ),
        distinctUntilChanged(),
        switchMap(value =>
          value ? from(searchBackend(value)) : from(Promise.resolve([]))
        )
      );

      input$.subscribe(data => {
        setSuggestions(data);
      });
    }
  }, [searchRef]);

  return (
    <div className={classes.root}>
      <Paper className={classes.searchContainer}>
        <InputBase
          id={'search'}
          ref={searchRef}
          autoComplete={'off'}
          className={classes.input}
          placeholder="Search Google Maps"
          inputProps={{ 'aria-label': 'search google maps' }}
        />
        <IconButton className={classes.iconButton} aria-label="search">
          <SearchIcon />
        </IconButton>
        <Divider className={classes.divider} />
        <IconButton
          color="primary"
          className={classes.iconButton}
          aria-label="directions"
        >
          <DirectionsIcon />
        </IconButton>
      </Paper>
      <Paper className={classes.resultContainer}>
        {suggestions.map(d => {
          const icon = d.type === 'personalized' ? <HistoryIcon /> : null;
          const tailIcon =
            d.type === 'personalized' ? (
              <IconButton
                edge="end"
                aria-label="Remove"
                onClick={e => {
                  e.stopPropagation();
                  post('/api/completions/delete', {
                    completions: d.completion,
                  });
                }}
              >
                <DeleteForeverOutlinedIcon />
              </IconButton>
            ) : null;

          return (
            <ListItem
              className={classes.suggestionItem}
              key={d.completion}
              button
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText
                primary={d.completion}
                onClick={evt => {
                  post('/api/completion/increment', {
                    completion: d.completion,
                  });
                  document.getElementById('search').value = d.completion;
                  setSuggestions([]);
                }}
              />
              {tailIcon}
            </ListItem>
          );
        })}
      </Paper>
    </div>
  );
};

export default Search;
