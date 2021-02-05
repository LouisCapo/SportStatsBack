const getCurrentAge = (birthday) => {
  return Math.floor(((new Date().getTime() - new Date(birthday)) / (24 * 3600 * 365.25 * 1000)) | 0);
}

const getMembersAverageAge = (players) => {
	let ages = 0, i = 0;
	players.forEach(res => {
		ages += getCurrentAge(res.playerBirthday);
		i++; 
	})
	return ages / i;
}

module.exports = { getCurrentAge, getMembersAverageAge }