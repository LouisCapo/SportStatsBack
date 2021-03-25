const express = require('express');
const router = express.Router();
const db = require('../model/db');
const NewsService = require('../services/news.service');

const newsService = new NewsService();

router.get('/get-news', (req, res, next) => {
  try {
    const { id } = req.query;
    if (id.length !== 24) {
      return res.send({
          error: {
            code: 2,
            msg: 'Неверный формат id!',
          },
        }).status(400);
    }
    newsService
      .getNewsById(id)
      .then((currentNews) => {
        const data = {
          newsId: currentNews._id,
          newsTitle: currentNews.title ? currentNews.title : null,
          newsSubtitle: currentNews.subtitle ? currentNews.subtitle : null,
          newsText: currentNews.newsText ? currentNews.newsText : null,
          newsDate: currentNews.date ? currentNews.date : null,
          newsPhotos: currentNews.photos ? currentNews.photos : [],
          sportType: currentNews.sportType
            ? {
                title: currentNews.sportType.sportTitle,
                code: currentNews.sportType.sportCode,
              }
            : null,
        };
        return res.send(data).status(200);
      })
      .catch((err) => {
        return res.send({
            error: err.error,
          })
        .status(err.status);
      });
  } catch (err) {
    return res.send({
        error: {
          code: 0,
          msg: 'Непредвиденная ошибка!',
        },
      }).status(500);
  }
});

router.get('/get-news-list', (req, res, next) => {
  try {
    let { limit, offset, sportTypeCode } = req.query;
    if (!limit) {
      limit = 10;
    }
    if (!offset) {
      offset = 0;
    }
    if (!sportTypeCode) {
      return res.send({
        error: {
          code: 1,
          msg: 'Не выбран вид спорта!',
        },
      }).status(400);
    }
    db.News.find({ sportTypeCode: sportTypeCode })
      .limit(limit)
      .skip(offset)
      .then((news) => {
        let data = [];
        news.forEach((el) => {
          data.push({
            newsId: el._id,
            newsTitle: el.newsTitle,
            newsPhoto: el.photos[0],
            newsSubtitle: el.newsSubtitle,
            sportType: el.sportType,
            sportTypeCode: el.sportTypeCode
          });
        });
        res.send(data).status(200);
      })
      .catch((err) => {
        return res.send({
          error: {
            code: 2,
            msg: 'Новости не найдены!',
          },
        }).status(404);
      });
  } catch (err) {
    return res.send({
      error: {
        code: 2,
        msg: 'Непредвиденная ошибка!',
      },
    }).status(500);
  }
});

module.exports = router;
