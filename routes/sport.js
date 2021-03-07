const express = require('express');
const router = express.Router();
const db = require('../model/db');
const isAuthenticated = require('../controllers/auth');
const helper = require('../services/helper');

router.get('/sport-list', (req, res, next) => { 
  try {
    db.Sports.find({}).then(sportList => {
      return res.send(sportList).status(200);
    }).catch(err => {
      return res.send({
        error: {
          code: 1,
          msg: 'Не найдены виды спорта!',
        },
      }).status(404);
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
    const isAdmin = await helper.isUserAdmin(req.user.id)
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
    let newSportCode;
    console.log(lastSportType)
    if (lastSportType) {
      newSportCode = lastSportType.sportCode + 1;
    } else {
      newSportCode = 0;
    }
    const data = {
      sportTitle: sportTitle,
      sportCode: newSportCode
    }
    console.log(data);
    const newSportType = new db.Sports(data);
    newSportType.save().then(newSport => {
      res.send(newSport).status(200);
    }).catch(err => {
      return res.send({
        error: {
          code: 1,
          msg: 'Не удалось сохранить игрока!',
        },
      }).status(400);
    })
  } catch(err) {
    console.log(err);
    return res.send({
      error: {
        code: 0,
        msg: 'Непредвиденная ошибка!',
      },
    }).status(500);
  }
})


module.exports = router;