const express = require('express');
const router = express.Router();
const db = require('../model/db');
const HelperService = require('../services/helper.service');
const TeamService = require('../services/team.service');

const helperService = new HelperService();
const teamService = new TeamService();

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
    teamService.getTeamById(id).then(currentTeam => {
      const data = {
        teamId: currentTeam._id,
        teamName: currentTeam.teamName,
        teamLogo: currentTeam.teamLogo ? currentTeam.teamLogo : null,
        teamMembers: currentTeam.teamMembers.length ? currentTeam.teamMembers.map(player => {
          return {
            memberName: player.playerName ? player.playerName : null,
            memberNick: player.playerNick ? player.playerNick : null,
            memberPhoto: player.playerPhoto ? player.playerPhoto : null,
            memberId: player._id,
          }
        }) : [],
        teamStats: currentTeam.teamStats ? currentTeam.teamStats : [],
        sportType: currentTeam.sportType ? {
          sportTypeCode: currentTeam.sportType.sportCode,
          sportTypeTitle: currentTeam.sportType.sportTitle
        } : null,
        memberAverageAge: currentTeam.teamMembers ? helperService.getMembersAverageAge(currentTeam.teamMembers) : null,
      }
      return res.send(data).status(200);
    }).catch(err => {
      return res.send({
        error: err.error,
      }).status(err.status);
    })
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
