const express = require('express');
const isAuthenticated = require('../controllers/auth');
const router = express.Router();
const AuthService = require('../services/auth.service');
const MatchesService = require('../services/matches.service')
const HelperService = require('../services/helper.service')

const authService = new AuthService();
const matchesService = new MatchesService();
const helperService = new HelperService();

router.get('/games-list', (req, res, next) => {
  let { limit, offset, sportTypeCode, isCompleted } = req.query;
  limit = limit ? limit : 10;
  offset = offset ? offset : 0;
  if (helperService.isNullOrUndefined(sportTypeCode) || helperService.isNullOrUndefined(isCompleted)) {
    return res.send({
      error: {
        code: 1,
        msg: 'Не переданы обязательный параметры!',
      },
    }).status(400);
  }
  if (limit > 1000) {
    return res.send({
      error: {
        code: 2,
        msg: 'Слишком большой limit!',
      },
    }).status(400);
  }
  matchesService.getMatchesList(sportTypeCode, offset, limit, isCompleted).then(matchList => {
    const data = matchList.map(item => {
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
        date: item.date ? item.date : null,
        score: {
          firstTeam: item.score.firstTeam ? item.score.firstTeam : null,
          secondTeam: item.score.secondTeam ? item.score.secondTeam : null,
        },
        sportType: {
          code: item.sportType.sportCode,
          title: item.sportType.sportTitle, 
        },
      }
    });
    return res.send({data: data}).status(200);
  }).catch(err => {
    console.log(err)
    return res.send({
      error: err.error,
    }).status(err.status);
  })
})

router.get('/match', (req, res, next) => {
  let { id } = req.query;
  if (helperService.isNullOrUndefined(id)) {
    return res.send({
      error: {
        code: 1,
        msg: 'Не переданы обязательный параметры!',
      },
    }).status(400);
  }
  matchesService.getMatchById(id).then(currentMatch => {
    const data = {
      matchId: currentMatch._id,
      firstTeam: {
        teamId: currentMatch.firstTeam._id,
        teamName: currentMatch.firstTeam.teamName,
        teamLogo: currentMatch.firstTeam.teamLogo ? currentMatch.firstTeam.teamLogo : null, 
      },
      secondTeam: {
        teamId: currentMatch.secondTeam._id,
        teamName: currentMatch.secondTeam.teamName,
        teamLogo: currentMatch.secondTeam.teamLogo ? currentMatch.secondTeam.teamLogo : null, 
      },
      date: currentMatch.date ? currentMatch.date : null,
      score: {
        firstTeam: currentMatch.score.firstTeam ? currentMatch.score.firstTeam : null,
        secondTeam: currentMatch.score.secondTeam ? currentMatch.score.secondTeam : null,
      },
      sportType: {
        code: currentMatch.sportType.sportCode,
        title: currentMatch.sportType.sportTitle, 
      },
    }
    return res.send(data).status(200);
  }).catch(err => {
    return res.send({
      error: err.error,
    }).status(err.status);
  })
})

router.post('/create-match', isAuthenticated, async (req, res, next) => {
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
    firstTeamId,
    secondTeamId,
    date,
    score,
    isCompleted,
    sportTypeCode
  } = req.body;
  if (helperService.isNullOrUndefined(firstTeamId) || 
      helperService.isNullOrUndefined(secondTeamId) || 
      helperService.isNullOrUndefined(sportTypeCode)) {
    return res.send({
      error: {
        code: 1,
        msg: 'Не переданы обязательный параметры!',
      },
    }).status(400);
  }
  if (firstTeamId.length !== 24 || secondTeamId.length !== 24) {
    return res.send({
      error: {
        code: 1,
        msg: 'Неверный формат teamId',
      },
    }).status(400);
  }
  matchesService.createNewMatch({firstTeamId, secondTeamId, date, score, isCompleted, sportTypeCode}).then(currentMatch => {
    return res.send({id: currentMatch._id}).status(200);
  }).catch(err => {
    return res.send({
      error: err.error,
    }).status(err.status);
  });
})

module.exports = router;