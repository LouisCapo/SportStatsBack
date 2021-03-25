const db = require('../model/db');
const jwt = require('jsonwebtoken');
const config = require('config');
const HelperService = require('./helper.service');

const helperService = new HelperService();

class AuthService {
  constructor() {}

  adminLogin(login, password) {
    return new Promise((resolve, reject) => {
      db.Admin.findOne({ login: login }).then((admin) => {
        if (admin) {
          if (helperService.isValidPassword(password, admin.password)) {
            const token = jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 720,
                id: admin._id,
              },
              config.get('jwtSecret')
            );
            return resolve({
              token: token,
            });
          }
          return reject({
            error: {
              code: 3,
              msg: 'Пароль неверный!',
            },
            status: 401,
          });
        }
        return reject({
          error: {
            code: 2,
            msg: 'Пользователь не найден!',
          },
          status: 404,
        });
      });
    });
  }

  isUserAdmin(id) {
    db.Admin.findById(id).then((admin) => {
      return !!admin;
    }).catch(err => {
      return false;
    });
  }

}

module.exports = AuthService;
