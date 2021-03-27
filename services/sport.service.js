const db = require('../model/db');

class SportService {
  constructor() { }

  getSportList() {
    return new Promise((resolve, reject) => {
      db.Sports.find({}).then(sportList => {
        if (sportList) {
          return resolve(sportList);
        }
        return reject({
          error: {
            code: 1,
            msg: 'Виды спорта отсутствуют!',
          },
          status: 404,
        });
      }).catch(err => {
        return reject({
          error: {
            code: 1,
            msg: 'Не удалось найти виды спорта!',
          },
          status: 404,
        });
      })
    })
  }

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