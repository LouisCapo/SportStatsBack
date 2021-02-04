const express = require('express');
const router = express.Router();
const db = require('../model/db');


router.get('/get-player', (req, res, next) => {
  try {
    const { id } = req.query;
    if (id.length !== 24) {
      return res.send({ error: { msg: 'Неверный формат id!' } }).status(400);
    }
    db.Player.findById(id)
      .populate('playerTeam')
      .then((currentPlayer) => {
        if (!currentPlayer) {
          return res.send({ error: { msg: 'Неверный id!' } }).status(400);
        }
        const data = {
          playerName: currentPlayer.playerName,
          playerNick: currentPlayer.playerNick,
          playerId: currentPlayer._id,
          playerPhoto: currentPlayer.playerPhoto,
          playerTeam: {
            teamName: currentPlayer.playerTeam.teamName,
            teamId: currentPlayer.playerTeam._id,
            teamLogo: currentPlayer.playerTeam.teamLogo,
          },
          playerStats: currentPlayer.playerStats,
          playerAchievements: currentPlayer.playerAchievements,
        };
        res.send(data);
      })
      .catch((err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
});


module.exports = router;