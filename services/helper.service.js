const bCrypt = require('bcrypt');

class HelperService {
	constructor() { }

	getCurrentAge(birthday) {
		return Math.floor(((new Date().getTime() - new Date(birthday)) / (24 * 3600 * 365.25 * 1000)) | 0);
	}

	isValidPassword(password, hashedPassword) {
		return bCrypt.compareSync(password, hashedPassword);
	};

	getMembersAverageAge(players) {
		let ages = 0;
		players.forEach(res => {
			ages += this.getCurrentAge(res.playerBirthday);
		});
		return (ages / players.length).toFixed(1);
	}

	isNullOrUndefined(value) {
		return value === undefined || value === null;
	}

}

module.exports = HelperService