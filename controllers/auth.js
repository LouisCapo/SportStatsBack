const jwt = require('jsonwebtoken')
const config = require('config')

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers['authorization']
    if (!token) {
      return res.status(401).send({
        error: {
          code: 1,
          msg: 'Отсутствует токен!',
        },
      }).status(403);
    }
    const decoded = jwt.verify(token, config.get('jwtSecret'))
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).send({
      error: {
        code: 0,
        msg: 'Неверный токен!',
      },
    });
  }
}

module.exports = isAuthenticated