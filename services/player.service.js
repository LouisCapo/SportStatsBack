const db = require('../model/db');
const SportService = require('../services/sport.service');
const TeamService = require('../services/team.service');

const sportService = new SportService();
const teamService = new TeamService();

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
            status: 501,
          });
        });
    });
  }

  editPlayer(player) {
    return new Promise(async (resolve, reject) => {
      const sportType = await sportService.getSportTypeByCode(player.sportTypeCode);
      let team;
      if (player.playerTeamId) {
        team = await teamService.getTeamById(player.playerTeamId);
      }
      db.Player.findById(player.playerId).then(currentPlayer => {
        if (!currentPlayer) {
          return reject({
            error: {
              code: 2,
              msg: 'Игрок не найден!',
            },
            status: 400,
          });
        }
        currentPlayer.playerName = player.playerName,
        currentPlayer.playerNick = player.playerNick ? player.playerNick : null,
        currentPlayer.playerPhoto = player.playerPhoto ? player.playerPhoto : null,
        currentPlayer.playerTeam = team?._id ? team._id : null,
        currentPlayer.playerBirthday = player.playerBirthday ? player.playerBirthday : null,
        currentPlayer.playerStats = player.playerStats ? player.playerStats : [],
        currentPlayer.sportType = sportType._id,
        currentPlayer.save().then(res => {
          return resolve(res);
        }).catch(err => {
          return reject({
            error: {
              code: 2,
              msg: 'Не удалось сохранить игрока!',
            },
            status: 501,
          });
        });
      }).catch(err => {
        return reject({
          error: {
            code: 2,
            msg: 'Игрок не найден!',
          },
          status: 400,
        });
      });
    });
  }
}

module.exports = PlayerService;
