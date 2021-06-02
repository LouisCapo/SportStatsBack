const express = require('express');
const router = express.Router();
const isAuthenticated = require('../controllers/auth');
const AuthService = require('../services/auth.service');
const HelperService = require('../services/helper.service');
const TeamService = require('../services/team.service');

const helperService = new HelperService();
const teamService = new TeamService();
const authService = new AuthService();

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

router.post('/create-team', isAuthenticated, async (req, res, next) => {
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
    teamName,
    teamLogo,
    sportTypeCode,
  } = req.body;
  if (!teamName || !sportTypeCode) {
    return res.send({
      error: {
        code: 2,
        msg: 'Не указанны обязательные поля!',
      },
    }).status(400);
  }
  const data = {
    teamName,
    teamLogo: teamLogo ? teamLogo : null,
    sportTypeCode,
  }
  teamService.createTeam(data).then(currentTeam => {
    return res.send({id: currentTeam._id});
  }).catch(err => {
    return res.send({
      error: err.error,
    }).status(err.status);
  })
});

router.put('/edit-team', isAuthenticated, async (req, res, next) => {
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
    teamId,
    teamName,
    teamLogo,
    sportTypeCode,
    memberList
  } = req.body
  if (teamId.length !== 24) {
    return res.send({
      error: {
        code: 1,
        msg: 'Неверный формат teamId!',
      },
    }).status(400);
  }
  if (helperService.isNullOrUndefined(teamName) || helperService.isNullOrUndefined(sportTypeCode)) {
    return res.send({
      error: {
        code: 2,
        msg: 'Не указанны обязательные поля!',
      },
    }).status(400);
  }
  teamService.editTeam({teamId, teamName, teamLogo, sportTypeCode, memberList}).then(currentTeam => {
    return res.send({Ok: 1}).status(200);
  }).catch(err => {
    return res.send({
      error: err.error,
    }).status(err.status);
  });
})

module.exports = router;
