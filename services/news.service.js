const db = require('../model/db');

class NewsService {
  constructor() { }

  getNewsById(id) {
    return new Promise((resolve, reject) => {
      db.News.findById(id)
      .then(async (currentNews) => {
        if (!currentNews) {
          return reject({
              error: {
                code: 1,
                msg: 'Новость не найдена!',
              },
              status: 404,
            });
        }
        if (currentNews.sportType) {
          await currentNews.populate('sportType').execPopulate();
        }
        resolve(currentNews);
      })
      .catch((err) => {
        return reject({
          error: {
            code: 1,
            msg: 'Новость не найдена!',
          },
          status: 404,
        });
      });
    })
  }

  getNewsListBySportCode(sportCode, limit, offset) {
    return new Promise((resolve, reject) => {
      db.News.find({sportTypeCode: sportCode}).skip(offset * limit).limit(limit).then(res => {
        // TODO
      })
    })
  }

}

module.exports = NewsService;