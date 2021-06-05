const express = require('express');
const router = express.Router();
const isAuthenticated = require('../controllers/auth');
const AuthService = require('../services/auth.service');
const HelperService = require('../services/helper.service');
const TeamService = require('../services/team.service');
const SearchService = require('../services/search.service');
const MatchesService = require('../services/matches.service');

const helperService = new HelperService();
const teamService = new TeamService();
const authService = new AuthService();
const matchesService = new MatchesService();

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
    teamService.getTeamById(id).then(async currentTeam => {
      const matchesList = await matchesService.getTeamUpcomingMatches(currentTeam);
      const mathesResponse = matchesList.map(item => {
        return {
          matchId: item._id,
          firstTeam: {
            teamId: item.firstTeam._id,
            teamName: item.firstTeam.teamName,
            teamLogo: item.firstTeam.teamLogo ? item.firstTeam.teamLogo : null, 
          },
          secondTeam: {
            teamId: item.secondTeam._id,
            teamName: item.secondTeam.teamName,
            teamLogo: item.secondTeam.teamLogo ? item.secondTeam.teamLogo : null, 
          },
          score: {
            firstTeam: helperService.isNullOrUndefined(item.score.firstTeam) ? null : item.score.firstTeam,
            secondTeam: helperService.isNullOrUndefined(item.score.secondTeam) ? null : item.score.secondTeam,
          } 
        }
      })
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
        lastMatches: mathesResponse,
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

router.get('/team-list', (req, res, next) => {
  let { offset, limit, sportTypeCode } = req.query;
  offset = offset ? offset : 1;
  limit = limit ? limit : 10;
  if (helperService.isNullOrUndefined(sportTypeCode)) {
    return res.send({
      error: {
        code: 2,
        msg: 'Не указанны обязательные поля!',
      },
    }).status(400);
  }
  teamService.getTeamList(limit, offset, sportTypeCode).then(teamList => {
    const data = teamList.map(item => {
      return {
        teamId: item._id,
        teamName: item.teamName,
        teamLogo: item.teamLogo ? item.teamLogo : null, 
        sportType: {
          code: item.sportType.sportCode,
          title: item.sportType.sportTitle,
        },
        teamMembers: item.teamMembers.length ? item.teamMembers.map(teamMember => {
          return {
            playerId: teamMember._id,
            playerName: teamMember.playerName,
            playerNick: teamMember.playerNick ? teamMember.playerNick : null,
            playerPhoto: teamMember.playerPhoto ? teamMember.playerPhoto : null,
          }
        }) : [],
      }
    });
    return res.send({data: data}).status(200);
  })
})

module.exports = router;
