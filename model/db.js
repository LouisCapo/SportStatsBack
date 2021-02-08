const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);
mongoose
  .connect(config.get('mongoUri'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successful connection');
  })
  .catch((err) => {
    console.error('Can t connect to db', err);
  });

const Player = mongoose.model('players', {
  playerName: { type: String, require: true },

  playerNick: { type: String },

  playerPhoto: { type: String },

  playerBirthday: { type: String },

  playerTeam: { type: Schema.Types.ObjectId, ref: 'teams' },

  playerAchievements: [{ label: String, newsId: String }],

  playerStats: [{ type: Object }],
});

const Team = mongoose.model('teams', {
  teamName: { type: String, require: true },

  teamLogo: { type: String },

  teamMembers: [{ type: Schema.Types.ObjectId, ref: 'players' }],

  teamStats: [{ type: Object }],

  sportType: { type: String },
});

const News = mongoose.model('news', {
  title: { type: String, require: true },

  subTitle: { type: String, require: true },

  description: { type: String, require: true },

  date: { type: String, require: true },

  photos: [{ type: String }],
});

module.exports = { Player, Team, News };
