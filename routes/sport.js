const express = require('express');
const router = express.Router();
const db = require('../model/db');
const isAuthenticated = require('../controllers/auth');
const AuthService = require('../services/auth.service');
const SportService = require('../services/sport.service');

const authService = new AuthService();
const sportService = new SportService();

router.get('/sport-list', (req, res, next) => { 
  try {
    sportService.getSportList().then(list => {
      const sportList = [];
      list.forEach(el => {
        sportList.push({
          code: el.sportCode,
          title: el.sportTitle 
        })
      })
      return res.send(sportList).status(200);
    }).catch(err => {
      return res.send({
        error: err.error,
      }).status(err.status);
    })
  } catch(err) {
    return res.send({
      error: {
        code: 0,
        msg: 'Непредвиденная ошибка!',
      },
    }).status(500);
  }
});

router.post('/create-sport-type', isAuthenticated, async (req, res, next) => {
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
    const { sportTitle } = req.body;
    if (!sportTitle) {
      return res.send({
        error: {
          code: 2,
          msg: 'Не указанно поле sportTitle!',
        },
      }).status(400);
    }
    const lastSportType = await db.Sports.findOne().sort({'_id':-1});
    let newSportCode = lastSportType ? lastSportType.sportCode + 1 : 0;
    const data = {
      sportTitle: sportTitle,
      sportCode: newSportCode
    }
    console.log(data);
    const newSportType = new db.Sports(data);
    newSportType.save().then(newSport => {
      res.send(newSport).status(200);
    }).catch(() => {
      return res.send({
        error: {
          code: 1,
          msg: 'Не удалось сохранить игрока!',
        },
      }).status(400);
    })
  } catch(err) {
    return res.send({
      error: {
        code: 0,
        msg: 'Непредвиденная ошибка!',
      },
    }).status(500);
  }
})


module.exports = router;