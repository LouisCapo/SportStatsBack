const db = require('../model/db');
const SportService = require('../services/sport.service');

const sportService = new SportService();

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
      db.News.find({sportTypeCode: sportCode}).skip(offset * limit).limit(limit).sort({date: -1}).then(res => {
        return resolve(res);
      }).catch(err => {
        console.log(err)
        return reject({
          error: {
            code: 3,
            msg: 'Новости не найдены!',
          },
          status: 400,
        });
      });
    });
  }

  createNewNews(news) {
    return new Promise((resolve, reject) => {
      const data = {
        title: news.newsTitle,
        subtitle: news.newsSubTitle,
        newsText: news.newsText,
        date: new Date(),
        photo: news.newsPhoto ? news.newsPhoto : null,
        sportTypeCode: news.newsSportTypeCode.toString() ? news.newsSportTypeCode : null,
      }
      const newNews = new db.News(data);
      newNews.save().then(res => {
        return resolve(res);
      }).catch(() => {
        return reject({
          error: {
            code: 2,
            msg: 'Не удалось сохранить новость!',
          },
          status: 400,
        });
      })
    })
  }

  editNews(news) {
    console.log(news)
    return new Promise(async (resolve, reject) => {
      db.News.findById(news.id).then(currentNews => {
        if (!currentNews) {
          return reject({
            error: {
              code: 1,
              msg: 'Игрок не найден!',
            },
            status: 400,
          });
        }
        currentNews.title = news.title;
        currentNews.subtitle = news.subtitle;
        currentNews.newsText = news.newsText;
        currentNews.sportTypeCode = news.sportTypeCode;
        currentNews.photo = news.photo ? news.photo : null;
        currentNews.save().then(res => {
          return resolve(res);
        }).catch(err => {
          return reject({
            error: {
              code: 2,
              msg: 'Не удалось сохранить новость!',
            },
            status: 501,
          });
        });
      }).catch(err => {
        return reject({
          error: {
            code: 2,
            msg: 'Не удалось сохранить новость!',
          },
          status: 501,
        });
      });
    })
  }

}

module.exports = NewsService;