const jwt = require('jsonwebtoken');
const AuthService = require('../services/auth.service');

const authService = new AuthService();

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers['authorization']
    if (!token) {
      return res.status(403).send({
        error: {
          code: 1,
          msg: 'Отсутствует токен!',
        },
      });
    }
    const decoded = jwt.verify(token, process.env.jwtSecret);
    if (Date.now() > decoded.exp) {
      return res.status(403).send({
        error: {
          code: 1,
          msg: 'Токен не действителен!',
        },
      })
    }
    const isAdmin = await authService.isUserAdmin(decoded.id)
    if (!isAdmin) {
      return res.status(403).send({
        error: {
          code: 1,
          msg: 'Нет доступа!',
        },
      })
    }
    next();
  } catch (err) {
    return res.status(403).send({
      error: {
        code: 0,
        msg: 'Неверный токен!',
      },
    });
  }
}

module.exports = isAuthenticated