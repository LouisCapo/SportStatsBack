const db = require('../model/db');
const SportService = require('../services/sport.service');

const sportService = new SportService();

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
      db.Matches.find({isCompleted: isCompleted, sportType: sportType._id }).sort({date: 1}).skip(offset * limit).limit(limit).then(async (list) => {    
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
            msg: 'Матчи не найден!',
          },
          status: 404,
        });
      }).catch(err => {
        return reject({
          error: {
            code: 1,
            msg: 'Матчи не найден!',
          },
          status: 404,
        });
      });
    });
  }

  createNewMatch(matchInfo) {
    return new Promise(async (resolve, reject) => {
      const data = {
        firstTeam: matchInfo.firstTeamId,
        secondTeam: matchInfo.secondTeamId,
        date: matchInfo.date ? matchInfo.date : null,
        isCompleted: matchInfo.isCompleted ? matchInfo.isCompleted : false,
        score: {
          firstTeam: matchInfo.score.firstTeam ? matchInfo.score.firstTeam : null,
          secondTeam: matchInfo.score.secondTeam ? matchInfo.score.secondTeam : null,
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
}

module.exports = MatchesService;