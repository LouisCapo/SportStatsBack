const express = require('express');
const router = express.Router();
const SearchService = require('../services/search.service');
const HelperService = require('../services/helper.service')

const searchService = new SearchService();
const helperService = new HelperService();

router.get('/get-coincidence', async (req, res, next) => {
  const { value } = req.query;
  if (helperService.isNullOrUndefined(value)) {
    return res.send({
      error: {
        code: 2,
        msg: 'Не передано значение',
      },
    }).status(400);
  }
  const data = [];
  Promise.all([
    searchService.getCoincidenceInTeamName(value),
    searchService.getCoincidenceInPlayerName(value),
    searchService.getCoincidenceInPlayerNick(value),
  ]).then((coincident) => {
    const teamList = coincident[0];
    const playerList = coincident[1].concat(coincident[2]);
    data.push(teamList.map(item => {
      return {
        type: 'team',
        id: item._id,
        title: item.teamName,
        photo: item.teamLogo ? item.teamLogo : null,
      }
    }));
    data.push(playerList.map(item => {
      if (!data.filter(el => el.id === item._id)[0]) {
        return {
          type: 'player',
          id: item._id,
          title: item.playerName,
          photo: item.playerPhoto ? item.playerPhoto : null,
        }
      }
    }));
    return res.send({data: data.flat()}).status(200);
  });
})

module.exports = router;