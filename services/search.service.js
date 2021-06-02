const db = require('../model/db');

class SearchService {
  constructor() { }

  getCoincidenceInTeamName(excerpt) {
    return new Promise((resolve, reject) => {
      db.Team.find({ teamName: {'$regex': excerpt, '$options': 'i'}}).then(res => {
        return resolve(res);
      }).catch(err => {
        return resolve([]);
      });
    });
  }

  getCoincidenceInPlayerName(excerpt) {
    return new Promise((resolve, reject) => {
      db.Player.find({ playerName: {'$regex': excerpt, '$options': 'i'}}).then(res => {
        return resolve(res);
      }).catch(err => {
        return resolve([]);
      });
    });
  }

  getCoincidenceInPlayerNick(excerpt) {
    return new Promise((resolve, reject) => {
      db.Player.find({ playerNick: {'$regex': excerpt, '$options': 'i'}}).then(res => {
        return resolve(res);
      }).catch(err => {
        return resolve([]);
      });
    });
  }
}

module.exports = SearchService;