const express = require('express');
const router = express.Router();
const isAuthenticated = require('../controllers/auth');
const AuthService = require('../services/auth.service');

const authService = new AuthService();

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
    authService.adminLogin(login, password).then(adminToken => {
      return res.send(adminToken).status(200);
    }).catch(err => {
      return res.send({
        error: err.error,
      }).status(err.status);
    })
  } catch(err) {
    return res.send({
          error: {
            code: 1,
            msg: 'Неизвестная ошибка!',
          },
        }).status(500);
  }
});

router.get('/isAdmin', isAuthenticated, async (req, res, next) => {
  try {
    return res.send({Ok: 1}).status(200);
  } catch(err) {
    return res.send({
      error: {
        code: 1,
        msg: 'Нет доступа!',
      },
    }).status(403);
  }
})

module.exports = router;
