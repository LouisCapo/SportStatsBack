const db = require('../model/db');
const SportService = require('../services/sport.service');
const HelperService = require('./helper.service')

const sportService = new SportService();
const helperService = new HelperService();

class MatchesService {
  constructor() { }

  getMatchById(id) {
    return new Promise((resolve, reject) => {
      db.Matches.findById(id).then(async (currentMatch) => {
        if (!currentMatch) {
          return reject({
            error: {
              code: 1,
              msg: 'Матч не найден!',
            },
            status: 404,
          });
        }
        await currentMatch.populate('sportType').execPopulate();
        await currentMatch.populate('firstTeam').execPopulate();
        await currentMatch.populate('secondTeam').execPopulate();
        return resolve(currentMatch);
      }).catch(err => {
        return reject({
          error: {
            code: 1,
            msg: 'Матч не найден!',
          },
          status: 404,
        });
      }) 
    })
  }

  getMatchesList(sportTypeCode, offset, limit, isCompleted) {
    return new Promise(async (resolve, reject) => {
      const sportType = await sportService.getSportTypeByCode(sportTypeCode);
      db.Matches.find({isCompleted: isCompleted, sportType: sportType._id }).sort({date: 1}).skip((offset - 1) * limit).limit(limit).then(async (list) => {   
        if (list.length) {
          return Promise.all(
            list.map(async (item) => {
              let populatedItem = item;
              await populatedItem.populate('firstTeam').execPopulate();
              await populatedItem.populate('secondTeam').execPopulate();
              await populatedItem.populate('sportType').execPopulate();
              return populatedItem;
            })
          ).then((result) => {
            return resolve(result);
          });
        }
        return reject({
          error: {
            code: 1,
            msg: 'Матчи не найдены!',
          },
          status: 404,
        });
      }).catch(err => {
        return reject({
          error: {
            code: 1,
            msg: 'Матчи не найдены!',
          },
          status: 404,
        });
      });
    });
  }

  createNewMatch(matchInfo) {
    return new Promise(async (resolve, reject) => {
      const firstTeam = await db.Team.find({_id: matchInfo.firstTeamId});
      const secondTeam = await db.Team.find({_id: matchInfo.secondTeamId});
      if (!firstTeam[0] || !secondTeam[0]) {
        return reject({
          error: {
            code: 3,
            msg: 'Команды не существуют!',
          },
          status: 400,
        });
      }
      const data = {
        firstTeam: matchInfo.firstTeamId,
        secondTeam: matchInfo.secondTeamId,
        date: matchInfo.date ? matchInfo.date : null,
        isCompleted: matchInfo.isCompleted ? matchInfo.isCompleted : false,
        score: {
          firstTeam: helperService.isNullOrUndefined(matchInfo.score.firstTeam) ? null : matchInfo.score.firstTeam,
          secondTeam: helperService.isNullOrUndefined(matchInfo.score.secondTeam) ? null : matchInfo.score.secondTeam,
        },
        sportType: await sportService.getSportTypeByCode(matchInfo.sportTypeCode),
      };
      const newMatch = new db.Matches(data);
      newMatch
        .save()
        .then((currentMatch) => {
          return resolve(currentMatch);
        })
        .catch(() => {
          return reject({
            error: {
              code: 2,
              msg: 'Не удалось сохранить новый матч!',
            },
            status: 400,
          });
        });
    })
  }

  getTeamUpcomingMatches(teamId) {
    return new Promise((resolve, reject) => {
      db.Matches.find({$or: [{firstTeam: teamId}, {secondTeam: teamId}], isCompleted: true}).sort({date: 1}).limit(10).then(matchesList => {
        if (matchesList.length) {
          return Promise.all(
            matchesList.map(async (item) => {
              let populatedItem = item;
              await populatedItem.populate('firstTeam').execPopulate();
              await populatedItem.populate('secondTeam').execPopulate();
              await populatedItem.populate('sportType').execPopulate();
              return populatedItem;
            })
          ).then((result) => {
            return resolve(result);
          });
        }
        return resolve([]);
      }).catch(err => {
        return resolve([]);
      });
    });
  }
}

module.exports = MatchesService;