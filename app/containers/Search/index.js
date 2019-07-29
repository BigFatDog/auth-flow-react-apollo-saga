import React, { useEffect, useRef, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import HistoryIcon from '@material-ui/icons/History';
import BatteryCharging20Icon from '@material-ui/icons/BatteryCharging20';

import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';

import { fromEvent, from } from 'rxjs';
import {
  map,
  filter,
  distinctUntilChanged,
  debounceTime,
  switchMap,
} from 'rxjs/operators';
import debounce from 'lodash/debounce';

import { get, post } from '../../core/http/post';
import useStyles from './styles';

const Search = props => {
  const classes = useStyles();
  const searchRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [latestInput, setLatestInput] = useState(null);

  useEffect(() => {
    if (searchRef !== null) {
      const searchBox = document.getElementById('search');
      const searchBackend = prefix => {
        setLatestInput(prefix);

        return get(
          `/api/completions/get?prefix=${prefix}&limit=10&scores=true`
        ).then(res => res.data);
      };

      const input$ = fromEvent(searchBox, 'input').pipe(
        map(e => e.target.value),
        debounceTime(250),
        filter(
          query =>
            (query.length >= 1 && query.length <= 10) ||
            query.length === 0 ||
            suggestions.map(d => d.completion).includes(query)
        ),
        distinctUntilChanged(),
        switchMap(value =>
          value ? from(searchBackend(value)) : from(Promise.resolve([]))
        )
      );

      input$.subscribe(data => {
        setSuggestions(data);
      });

      // re-fetch suggestions when user clicks on input
      const focus$ = fromEvent(searchBox, 'focus').pipe(
        map(e => e.target.value),
        debounceTime(250),
        switchMap(value => from(searchBackend(value)))
      );

      focus$.subscribe(data => {
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
          placeholder="Search Sample Data"
          inputProps={{ 'aria-label': 'search sample data' }}
        />
        <IconButton className={classes.iconButton} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
      <Paper className={classes.resultContainer}>
        {suggestions.map(d => {
          const icon =
            d.type === 'personalized' ? (
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
            ) : null;
          const onDeleteEntry = async e => {
            e.stopPropagation();

            await post('/api/completions/delete', {
              completions: d.completion,
            });
            const newData = await get(
              `/api/completions/get?prefix=${latestInput}&limit=10&scores=true`
            );
            setSuggestions(newData.data);
          };

          const tailIcon =
            d.type === 'personalized' ? (
              <IconButton
                edge="end"
                aria-label="Remove"
                onClick={debounce(onDeleteEntry, 250)}
              >
                <DeleteForeverOutlinedIcon />
              </IconButton>
            ) : null;

          return (
            <ListItem
              component={'li'}
              className={classes.suggestionItem}
              key={d.completion + d.score + d.type || ''}
              button
            >
              {icon}
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

      <IconButton
        aria-label="seed-sample-data"
        style={{
          position: 'absolute',
          bottom: 70,
          right: 50
        }}
        onClick={() => get('/api/completions/dump')}
      >
        <BatteryCharging20Icon />
      </IconButton>
    </div>
  );
};

export default Search;
