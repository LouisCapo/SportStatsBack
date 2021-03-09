const bCrypt = require('bcrypt');
const db = require('../model/db');

const getCurrentAge = (birthday) => {
  return Math.floor(((new Date().getTime() - new Date(birthday)) / (24 * 3600 * 365.25 * 1000)) | 0);
}

const isValidPassword = (password, hashedPassword) => {
  return bCrypt.compareSync(password, hashedPassword);
};


const getMembersAverageAge = (players) => {
	let ages = 0, i = 0;
	players.forEach(res => {
		ages += getCurrentAge(res.playerBirthday);
		i++; 
	})
	return ages / i;
}

const isUserAdmin = (id) => {
	db.Admin.findById(id).then((admin) => {
		return !!admin;
	});
}

module.exports = { getCurrentAge, getMembersAverageAge, isValidPassword, isUserAdmin }