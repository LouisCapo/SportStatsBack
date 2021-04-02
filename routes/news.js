const express = require('express');
const isAuthenticated = require('../controllers/auth');
const router = express.Router();
const db = require('../model/db');
const AuthService = require('../services/auth.service');
const NewsService = require('../services/news.service');

const newsService = new NewsService();
const authService = new AuthService();

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
    if (limit > 1000) {
      return res.send({
        error: {
          code: 2,
          msg: 'Слишком большой limit!',
        },
      }).status(400);
    }
    newsService.getNewsListBySportCode(sportTypeCode, limit, offset).then(newsList => {
      const data = [];
      newsList.forEach(elem => {
        data.push({
          newsId: elem._id,
          newsTitle: elem.title,
          newsSubtitle: elem.subtitle,
          newsText: elem.newsText,
          newsDate: elem.date ? elem.date : null,
          newsPhoto: elem.photo ? elem.photo : null,
        })
      })
      return res.send(data).status(200);
    }).catch(err => {
      return res.send({
        error: err.error,
      }).status(err.status);
    })
  } catch (err) {
    return res.send({
      error: {
        code: 2,
        msg: 'Непредвиденная ошибка!',
      },
    }).status(500);
  }
});

router.post('/create-news', isAuthenticated, async (req, res, next) => {
  const isAdmin = await authService.isUserAdmin(req.user.id);
  if (isAdmin) {
    return res.send({
      error: {
        code: 1,
        msg: 'Нет доступа!',
      },
    }).status(403);
  }
  const {
    newsTitle,
    newsSportTypeCode,
    newsSubTitle,
    newsText,
    newsPhoto
  } = req.body;
  if (!newsTitle || !newsSubTitle || !newsText) {
    return res.send({
      error: {
        code: 3,
        msg: 'Не переданы обязательные параметры!',
      },
    }).status(400);
  }
  newsService.createNewNews({
    newsTitle: newsTitle,
    newsSportTypeCode: newsSportTypeCode,
    newsSubTitle: newsSubTitle,
    newsText: newsText,
    newsPhoto: newsPhoto,
  }).then(newNews => {
    return res.send({ id: newNews._id });
  }).catch(err => {
    return res.send({
      error: err.error,
    }).status(err.status);
  })

})

module.exports = router;
