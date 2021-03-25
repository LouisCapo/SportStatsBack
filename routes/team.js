const express = require('express');
const router = express.Router();
const db = require('../model/db');
const HelperService = require('../services/helper.service');

const helperService = new HelperService();

router.get('/get-team', (req, res, next) => {
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
    db.Team.findById(id)
      .populate('teamMembers')
      .then((currentTeam) => {
        if (!currentTeam) {
          return res.send({
              error: {
                code: 1,
                msg: 'Команда не найдена!',
              },
            }).status(404);
        }
        const teamMembers = [];
        currentTeam.teamMembers.forEach((el) => {
          teamMembers.push({
            memberName: el.playerName,
            memberNick: el.playerNick,
            memberId: el._id,
            memberPhoto: el.playerPhoto,
          });
        });
        const data = {
          teamId: currentTeam._id,
          teamName: currentTeam.teamName,
          teamLogo: currentTeam.teamLogo,
          teamMembers: teamMembers,
          teamStats: currentTeam.teamStats,
          sportType: currentTeam.sportType,
          memberAverageAge: helperService.getMembersAverageAge(
            currentTeam.teamMembers
          ),
        };
        res.send(data).status(200);
      })
      .catch((err) => {
        return res.send({
            error: {
              code: 1,
              msg: 'Команда не найдена!',
            },
          }).status(404);
      });
  } catch (err) {
    return res.send({
        error: {
          code: 0,
          msg: 'Непредвиденная ошибка!',
        },
      }).status(500);
  }
});

module.exports = router;
