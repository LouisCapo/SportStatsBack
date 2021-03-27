const db = require('../model/db');
const SportService = require('../services/sport.service');

const sportService = new SportService();

class PlayerService {
  constructor() {}

  getPlayerById(playerId) {
    return new Promise((resolve, reject) => {
      db.Player.findById(playerId)
        .then(async (currentPlayer) => {
          if (!currentPlayer) {
            return reject({
              error: {
                code: 1,
                msg: 'Игрок не найден!',
              },
              status: 404,
            });
          }
          if (currentPlayer.playerTeam) {
            await currentPlayer.populate('playerTeam').execPopulate();
          }
          if (currentPlayer.sportType) {
            await currentPlayer.populate('sportType').execPopulate();
          }
          return resolve(currentPlayer);
        })
        .catch((err) => {
          return reject({
            error: {
              code: 1,
              msg: 'Игрок не найден!',
            },
            status: 404,
          });
        });
    });
  }

  createPlayer(player) {
    return new Promise(async (resolve, reject) => {
      const data = {
        playerName: player.playerName ? player.playerName : null,
        playerNick: player.playerNick ? player.playerNick : null,
        playerBirthday: player.playerBirthday ? player.playerBirthday : null,
        playerTeam: player.playerTeam ? player.playerTeam : null,
        playerPhoto: player.playerPhoto ? player.playerPhoto : null,
        playerStats: player.playerStats ? player.playerStats : [],
        sportType: null,
      }
      if (player.sportTypeCode !== undefined && player.sportTypeCode !== null) {
        const playerSport = await sportService.getSportTypeByCode(player.sportTypeCode);
        data.sportType = playerSport._id;
      }
      const newPlayer = new db.Player(data);
      newPlayer
        .save()
        .then((newPlayer) => {
          return resolve(newPlayer);
        })
        .catch(() => {
          return reject({
            error: {
              code: 2,
              msg: 'Не удалось сохранить игрока!',
            },
            status: 400,
          });
        });
    });
  }
}

module.exports = PlayerService;
