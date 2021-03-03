const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../model/db');
const config = require('config');
const helper = require('../services/helper');

router.post('/login', (req, res, next) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.send({
        error: {
          code: 4,
          msg: 'Не все поля заполнены!',
        },
      }).status(400);
    }
    db.Admin.findOne({ login: login }).then((admin) => {
      if (admin) {
        if (helper.isValidPassword(password, admin.password)) {
          const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 720,
              id: admin._id,
            },
            config.get('jwtSecret')
          );
          return res.send({
              token: token,
            }).status(200);
        }
        return res.send({
            error: {
              code: 3,
              msg: 'Пароль неверный!',
            },
          }).status(401);
      }
      return res.send({
          error: {
            code: 2,
            msg: 'Пользователь не найден!',
          },
        }).status(404);
    });
  } catch(err) {
    return res.send({
          error: {
            code: 1,
            msg: 'Неизвестная ошибка!',
          },
        }).status(500);
  }
});

module.exports = router;
