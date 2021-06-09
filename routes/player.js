const express = require('express');
const router = express.Router();
const isAuthenticated = require('../controllers/auth');
const PlayerService = require('../services/player.service');
const AuthService = require('../services/auth.service');
const HelperService = require('../services/helper.service');

const playerService = new PlayerService();
const authService = new AuthService();
const helperService = new HelperService();

router.get('/get-player', async (req, res, next) => {
  try {
    const { id } = req.query;
    if (id.length !== 24) {
      return res
        .send({
          error: {
            code: 2,
            msg: 'Неверный формат id!',
          },
        })
        .status(400);
    }
    playerService.getPlayerById(id).then(player => {
      const data = {
        playerId: player._id,
        playerName: player.playerName ? player.playerName : null,
        playerNick: player.playerNick ? player.playerNick : null,
        playerPhoto: player.playerPhoto ? player.playerPhoto: null,
        playerBirthday: player.playerBirthday ? player.playerBirthday : null,
        playerAge: player.playerBirthday ? helperService.getCurrentAge(player.playerBirthday) : null,
        playerTeam: player.playerTeam ? {
          teamName: player.playerTeam.teamName,
          teamId: player.playerTeam._id,
          teamLogo: player.playerTeam.teamLogo,
        } : null,
        playerStats: player.playerStats ? player.playerStats : null,
        sportType: player.sportType ? {
          title: player.sportType.sportTitle,
          code: player.sportType.sportCode,
        } : null,
      }
      return res.send(data).status(200);
    }).catch(err => {
      return res.send({
        error: err.error,
      }).status(err.status);
    })
  } catch (error) {
    res
      .send({
        error: {
          code: 0,
          msg: 'Непредвиденная ошибка!',
        },
      })
      .status(500);
  }
});

router.post('/create-player', isAuthenticated, async (req, res, next) => {
  try {
    const isAdmin = await authService.isUserAdmin(req.user.id);
    if (isAdmin) {
      return res.send({
        error: {
          code: 1,
          msg: 'Нет доступа!',
        },
      }).status(403);
    } 
    const {
      playerName,
      playerNick,
      playerPhoto,
      playerBirthday,
      playerTeamId,
      playerStats,
      sportTypeCode,
    } = req.body;
    if (!playerName) {
      return res.send({
          error: {
            code: 3,
            msg: 'Не передан playerName!',
          },
        }).status(400);
    }
    const data = {
      playerName: playerName,
      playerNick: playerNick,
      playerPhoto: playerPhoto,
      playerBirthday: playerBirthday,
      playerTeam: playerTeamId,
      playerStats: playerStats,
      sportTypeCode: sportTypeCode,
    };
    playerService.createPlayer(data).then(newPlayer => {
      res.send({
        id: newPlayer._id,
      }).status(200);
    }).catch(err => {
      return res.send({
        error: err.error,
      }).status(err.status);
    })
  } catch (error) {
    res.send({
        error: {
          code: 0,
          msg: 'Непредвиденная ошибка!',
        },
      }).status(500);
  }
});

router.put('/edit-player', isAuthenticated, async (req, res, next) => {
  const isAdmin = await authService.isUserAdmin(req.user.id);
  if (isAdmin) {
    return res.send({
      error: {
        code: 1,
        msg: 'Нет доступа!',
      },
    }).status(403);
  }
  const {
    playerName,
    playerNick,
    playerPhoto,
    playerBirthday,
    playerTeamId,
    playerStats,
    sportTypeCode,
    playerId,
  } = req.body;
  if (helperService.isNullOrUndefined(playerName) || 
      helperService.isNullOrUndefined(sportTypeCode) || 
      helperService.isNullOrUndefined(playerId) || 
      playerId.length !== 24) {
    return res.send({
      error: {
        code: 3,
        msg: 'Не переданы обязательные параметры!',
      },
    }).status(400);
  }
  const data = {
    playerName,
    sportTypeCode,
    playerId,
    playerNick: playerNick ? playerNick : null,
    playerPhoto: playerPhoto ? playerPhoto : null,
    playerBirthday: playerBirthday ? playerBirthday : null,
    playerTeamId: playerTeamId ? playerTeamId : null,
    playerStats: playerStats && playerStats.length ? playerStats : [],
  }
  playerService.editPlayer(data).then(currentPlayer => {
    return res.send({id: currentPlayer._id});
  }).catch(err => {
    return res.send({
      error: err.error,
    }).status(err.status);
  })
})

module.exports = router;
