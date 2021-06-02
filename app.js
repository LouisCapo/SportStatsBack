const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const playerRouter = require('./routes/player');
const teamRouter = require('./routes/team');
const newsRouter = require('./routes/news');
const authRouter = require('./routes/auth');
const sportRouter = require('./routes/sport');
const gamesRouter = require('./routes/games');
const searchRouter = require('./routes/search')

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  next();
});


app.use('/api/players/', playerRouter);
app.use('/api/teams/', teamRouter);
app.use('/api/news/', newsRouter);
app.use('/api/auth', authRouter);
app.use('/api/sport', sportRouter);
app.use('/api/games', gamesRouter);
app.use('/api/search', searchRouter);

module.exports = app;
