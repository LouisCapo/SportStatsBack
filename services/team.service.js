const db = require('../model/db');
const SportService = require('../services/sport.service');

const sportService = new SportService();

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

  createTeam(teamInfo) {
    return new Promise(async (resolve, reject) => {
      const sportType = await sportService.getSportTypeByCode(teamInfo.sportTypeCode);
      const data = {
        teamName: teamInfo.teamName,
        teamLogo: teamInfo.teamLogo ? teamInfo.teamLogo : null,
        teamMembers: [],
        teamStats: [],
        sportType: sportType._id,
      }
      const newTeam = new db.Team(data);
      newTeam.save().then(currentTeam => {
        return resolve(currentTeam);
      }).catch(err => {
        return reject({
          error: {
            code: 2,
            msg: 'Не удалось сохранить новыую команду!',
          },
          status: 400,
        });
      })
    })
  }
}

module.exports = TeamService;