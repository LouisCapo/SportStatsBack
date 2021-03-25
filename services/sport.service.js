const db = require('../model/db');

class SportService {
  constructor() { }

  getSportTypeByCode(code) {
    return new Promise((resolve, reject) => {
      db.Sports.findOne({sportCode: code}).then(res => {
        if (res) {
          return resolve(res);
        }
        return reject({
          error: {
            code: 1,
            msg: 'Вид спорта не найден!',
          },
          status: 404,
        });
      }).catch(err => {
        return reject({
          error: {
            code: 1,
            msg: 'Вид спорта не найден!',
          },
          status: 404,
        });
      })
    })
  }

}

module.exports = SportService;