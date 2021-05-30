const db = require('../model/db');

class TeamService {
  constructor() { }

  getTeamById(id) {
    return new Promise((resolve, reject) => {
      db.Team.findById(id).then(async (team) => {
        if (!team) {
          return reject({
            error: {
              code: 1,
              msg: 'Команда не найдена!',
            },
            status: 404,
          });
        }
        if (team.teamMembers.length) {
          await team.populate('teamMembers').execPopulate();
        }
        if (team.sportType) {
          await team.populate('sportType').execPopulate();
        }
        return resolve(team);
      }).catch(err => {
        return reject({
          error: {
            code: 1,
            msg: 'Команда не найдена!',
          },
          status: 404,
        });
      });
    });
  }
}

module.exports = TeamService;