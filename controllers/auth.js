const jwt = require('jsonwebtoken')
const config = require('config')

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers['authorization']
    if (!token) {
      return res.send({
        error: {
          code: 1,
          msg: 'Отсутствует токен!',
        },
      }).status(401);
    }
    console.log(token)
    const decoded = jwt.verify(token, config.get('jwtSecret'))
    req.user = decoded
    next()
  } catch (err) {
    return res.send({
      error: {
        code: 0,
        msg: 'Неверный токен!',
      },
    }).status(401);
  }
}

module.exports = isAuthenticated