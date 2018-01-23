# Auth flow with React, Apollo, Redux-Saga and Mongo

doc is in progress

## Setup
1. install mongodb
2. clone this project
3. npm install
4. npm run start
5. visit localhost:3010

## Features
This application aims to demonstrate a full stack login/register flow based on React, Redux, Apollo, Redux-saga and MongoDB.
I hope to make a solid workflow for a mature product.

* login/register flow based on access token and refresh token.
* verify token on route change (implemented via High-Order-Component)
* verify token on both web endpoint and apollo endpoint
* failures of verifying tokens will redirect user to login page
* handling error messages in details
* i18n.
* fontawesome 5

Common failures
* lost server connection
* opertation timeout
* MongoDB down

Login failures
* User not found
* Invalid credentials

Register failures
* user already exists
* email already exists

## Implementation
### Project Structure
I started this project with [React Boilerplate](https://github.com/react-boilerplate/react-boilerplate). The following adjustments are made per my own needs:
1. server code are compiled to build/server
2. .graphql support
3. server logic are in ES6
4. add apollo server and client
5. axios is used for rest call

### Web Server authentication v.s. GraphQL authentication
It has been introduced in this awesome tutorial: [Apollo Tutorial](https://dev-blog.apollodata.com/a-guide-to-authentication-in-graphql-e002a4039d1).
I chose the web server approach.

### Authentication on route changes: HOC v.s. onEnter()
TBD

## Limitations
* Apollo WebSocket failures haven't been verified
* No 3rd party auth support. (passport-facebook, passport-github)
* No Server rendering support. I'd go for next.js if server rendering is needed
* No tests

## Credits
* [React Boilerplate](https://github.com/react-boilerplate/react-boilerplate) the initial project structure
* [Apollo Universal Starter Kit](https://github.com/sysgears/apollo-universal-starter-kit) implementation of access token and refresh token

## License
MIT
