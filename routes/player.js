const express = require('express');
const router = express.Router();
const db = require('../model/db');
const helper = require('../services/helper');

router.get('/get-player', (req, res, next) => {
  try {
    const { id } = req.query;
    if (id.length !== 24) {
      return res.send({
          error: {
            code: 2,
            msg: 'Неверный формат id!',
          },
        }).status(400);
    }
    db.Player.findById(id)
      .populate('playerTeam')
      .then((currentPlayer) => {
        if (!currentPlayer) {
          return res.send({
              error: {
                code: 1,
                msg: 'Игрок не найден!',
              },
            }).status(404);
        }
        const data = {
          playerName: currentPlayer.playerName,
          playerNick: currentPlayer.playerNick,
          playerId: currentPlayer._id,
          playerPhoto: currentPlayer.playerPhoto,
          playerAge: helper.getCurrentAge(currentPlayer.playerBirthday),
          playerTeam: {
            teamName: currentPlayer.playerTeam.teamName,
            teamId: currentPlayer.playerTeam._id,
            teamLogo: currentPlayer.playerTeam.teamLogo,
          },
          playerStats: currentPlayer.playerStats,
          playerAchievements: currentPlayer.playerAchievements,
        };
        return res.send(data).status(200);
      })
      .catch((err) => {
        res.send({
            error: {
              code: 1,
              msg: 'Игрок не найден!',
            },
          }).status(404);
      });
  } catch (error) {
    res.send({
        error: {
          code: 0,
          msg: 'Непредвиденная ошибка!',
        },
      }).status(500);
  }
});

module.exports = router;
