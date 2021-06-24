const express = require('express');
const isAuthenticated = require('../controllers/auth');
const errorMiddleware = require('../controllers/error-middleware');
const router = express.Router();
const NewsService = require('../services/news.service');
const SportService = require('../services/sport.service');
const HelperService = require('../services/helper.service');

const newsService = new NewsService();
const sportService = new SportService();
const helperService = new HelperService();

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
    newsService.getNewsById(id).then(async (currentNews) => {
      let sportType;
      if (!helperService.isNullOrUndefined(currentNews.sportTypeCode)) {
        sportType = await sportService.getSportTypeByCode(currentNews.sportTypeCode)
      }
        const data = {
          newsId: currentNews._id,
          newsTitle: currentNews.title ? currentNews.title : null,
          newsSubtitle: currentNews.subtitle ? currentNews.subtitle : null,
          newsText: currentNews.newsText ? currentNews.newsText : null,
          newsDate: currentNews.date ? currentNews.date : null,
          newsPhoto: currentNews.photo ? currentNews.photo : null,
          sportType: sportType
            ? {
                title: sportType.sportTitle,
                code: sportType.sportCode,
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
});

router.put('/edit-news', isAuthenticated, (req, res, next) => {
  const {
    id,
    newsTitle,
    sportTypeCode,
    newsSubtitle,
    newsText,
    newsPhoto
  } = req.body;
  if (
    helperService.isNullOrUndefined(id) ||
    helperService.isNullOrUndefined(newsTitle) ||
    helperService.isNullOrUndefined(sportTypeCode) ||
    helperService.isNullOrUndefined(newsSubtitle) ||
    helperService.isNullOrUndefined(newsText)
  ) {
    return next({
      code: 0,
      msg: 'Не переданы обязательные параметры!',
      status: 400,
    });
  }
  if (id.length !== 24) {
    console.log(321)
    return next({
      code: 0,
      msg: 'Неверный формат id!',
      status: 400,
    });
  }
  const data = {
    title: newsTitle,
    id,
    sportTypeCode,
    subtitle: newsSubtitle,
    newsText,
    photo: newsPhoto ? newsPhoto : null,
  }
  console.log(123123)
  newsService.editNews(data).then(currentNews => {
    return res.send({id: currentNews._id}).status(200);
  }).catch(err => {
    return next({
      code: 0,
      msg: 'Непредвиденная ошибка!',
      logMessage: err,
      status: 500,
    });
  });
}, errorMiddleware);

module.exports = router;
