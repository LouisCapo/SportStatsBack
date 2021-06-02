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
  const teamResult = await searchService.getCoincidenceInTeamName(value);
  const playerNameResult = await searchService.getCoincidenceInPlayerName(value);
  const playerNickResult = await searchService.getCoincidenceInPlayerNick(value);
  data.push(teamResult.map(item => {
    return {
      type: 'team',
      id: item._id,
      title: item.teamName,
      photo: item.teamLogo ? item.teamLogo : null,
    }
  }));
  data.push(playerNameResult.map(item => {
    return {
      type: 'player',
      id: item._id,
      title: item.playerName,
      photo: item.playerPhoto ? item.playerPhoto : null,
    }
  }));
  data.push(playerNickResult.map(item => {
    return {
      type: 'player',
      id: item._id,
      title: item.playerName,
      photo: item.playerPhoto ? item.playerPhoto : null,
    }
  }))
  return res.send({data: [].concat(...data).slice(0, 10)}).status(200);
})

module.exports = router;