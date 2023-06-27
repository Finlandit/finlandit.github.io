async function getLeaderboard() {
	const data = await fetchWikiDatabase(leaderboardURL);

	function getAmounts(obj) {
		const bannedAmount = obj?.piss; // ಠಿ_ಠ ... piss off?
		const lockedAmount = obj?.lock;
		const removedAmount = obj?.remove;
		const restoredAmount = obj?.restore;
		const stickiedAmount = obj?.sticky;
		const unlockedAmount = obj?.unlock;

		return [ bannedAmount, removedAmount, restoredAmount, lockedAmount, unlockedAmount, stickiedAmount ];
	}

	const formattedData = Object.keys(data).map(username => {
		const d = data[username];
		const obj = { username, ...d };

		const amounts = getAmounts(obj);

		return { username, 'amounts': amounts };
	});

	const orderedData = formattedData
		.filter(obj => getSumOfArr(obj.amounts) != 0)
		.sort((a, b) => getSumOfArr(b.amounts) - getSumOfArr(a.amounts))
		.map((obj, rank) => {
			const rankText = `<span data-rank="${rank + 1}">#${rank + 1}</span>`;

			const username = obj?.username;
			const usernameText = formatToHtmlRedditLink(formatToRedditUserURL(username, true), username, 'User Profile Link');


			return [ rankText , usernameText, ...obj.amounts ]
		});

	return orderedData;
}

async function load() {
	const leaderboard = await getLeaderboard();

	new gridjs.Grid({
		columns: [
			{ 
				name: 'Rank',
				formatter: cell => gridjs.html(cell),
				sort: {
					compare: (a, b) => gridCustomCompareSort(a, b, elem => {
						return elem.querySelector('span[data-rank]')?.dataset?.rank;
					})
				}
			},
			{ name: 'User', formatter: cell => gridjs.html(cell) },
			'Banned',  'Removed', 'Restored', 'Locked', 'Unlocked', 'Stickied'
		],
		data: leaderboard,
		search: true,
		resizable: true,
		sort: true
	}).render(document.querySelector('#leaderboard-table'));
}

load();