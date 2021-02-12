const express = require('express');
const router = express.Router();
const db = require('../model/db');
const helper = require('../services/helper');

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
    db.News.findById(id)
      .then((currentNews) => {
        if (!currentNews) {
          return res.send({
              error: {
                code: 1,
                msg: 'Новость не найдена!',
              },
            }).status(404);
        }
        const data = {
          newsId: currentNews._id,
          newsTitle: currentNews.title,
          newsSubtitle: currentNews.subtitle,
          newsText: currentNews.newsText,
          newsDate: currentNews.date,
          newsPhotos: currentNews.photos ? currentNews.photos : null,
          sportType: currentNews.sportType
        };
        res.send(data).status(200);
      })
      .catch((err) => {
        return res.send({
            error: {
              code: 1,
              msg: 'Новость не найдена!',
            },
          }).status(404);
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
