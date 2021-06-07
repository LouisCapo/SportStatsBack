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

  editTeam(teamInfo) {
    return new Promise(async (resolve, reject) => {
      const sportType = await sportService.getSportTypeByCode(teamInfo.sportTypeCode);
      let currentTeam = await db.Team.findById({_id: teamInfo.teamId});
      if (!currentTeam) {
        return reject({
          error: {
            code: 2,
            msg: 'Не удалось найти команду!',
          },
          status: 400,
        });
      }
      currentTeam.teamName = teamInfo.teamName;
      currentTeam.sportType = sportType._id;
      currentTeam.teamLogo = teamInfo.teamLogo ? teamInfo.teamLogo : null,
      currentTeam.teamStats = teamInfo.teamStats ? teamInfo.teamStats : [],
      currentTeam.teamMembers = teamInfo.memberList ? teamInfo.memberList : [],
      currentTeam.save().then(updatedTeam => {
        return resolve(updatedTeam);
      }).catch(err => {
        return reject({
          error: {
            code: 2,
            msg: 'Не удалось сохранить информацию по команде!',
          },
          status: 501,
        });
      });
    });
  }

  async getTeamList(limit, offset, sportTypeCode) {
    const sportType = await sportService.getSportTypeByCode(sportTypeCode);
    return new Promise((resolve, reject) => {
      db.Team.find({sportType: sportType._id}).skip((offset - 1) * limit).limit(limit).then(teamList => {
        console.log(teamList)
        if (teamList.length) {
          return Promise.all(
            teamList.map(async (item) => {
              await item.populate('sportType')
                        .populate('teamMembers')
                        .execPopulate();
              return item;
            })
          ).then((populatedItem) => {
            return resolve(teamList);
          })
        }
        return resolve([]);
      }).catch(err => {
        return resolve([]);
      });
    })
  }
}

module.exports = TeamService;