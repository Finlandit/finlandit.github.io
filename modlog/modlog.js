const activityChartElem = document.querySelector('#activity-chart');

function getColor(action, alpha = 1) {
	const colorMap = {
		'Banned User': [185, 0, 0],
		'Removed Submission': [250, 50, 50],
		'Removed Comment': [250, 50, 50],
		'Sticky Submission': [0, 93, 155],
		'Sticky Comment': [0, 93, 155],
		'Restored Submission': [55, 155, 0],
		'Restored Comment': [55, 155, 0],
		'Unlocked Submission': [55, 155, 0],
		'Unlocked Comment': [55, 155, 0],
		'Locked Submission': [186, 152, 0],
		'Locked Comment': [186, 152, 0],
	};
  
	const colorValues = colorMap[action] || [0, 0, 0];

	return `rgb(${colorValues.join(', ')}, ${alpha})`;
}

function displayGraph(data) {
	const actionCounts = data.reduce((acc, obj) => {
		const action = capitalize(obj.action.toLowerCase());
		const datetime = obj.datetime + '+02:00';
		const date = new Date(datetime);
		const day = date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' });

		if (!acc[day]) {
			acc[day] = {};
		}

		if (!acc[day][action]) {
			acc[day][action] = 0;
		}

		acc[day][action] += 1;

		return acc;
	}, {});
  
	const dayArr = Object.keys(actionCounts);
	const datasets = [...new Set(dayArr.flatMap((day) => Object.keys(actionCounts[day])))].sort();

	const chartData = dayArr.map(day => {
		const counts = datasets.map(action => actionCounts[day][action] || 0);

		return { day, counts };
	});

	const backgroundColors = datasets.map((action) => getColor(action));
	const hoverBackgroundColors = datasets.map((action) => getColor(action, 0.5));
  
	Chart.defaults.font.family = 'Mona Sans';
  
	const chartConfig = {
		type: 'bar',
		data: {
			labels: dayArr,
			datasets: datasets.map((action, index) => {
				return {
					label: action,
					data: chartData.map((data) => data.counts[index]),
					backgroundColor: backgroundColors[index],
					hoverBackgroundColor: hoverBackgroundColors[index],
					borderWidth: 2,
					borderRadius: 3
				};
			}),
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					stacked: true,
					grid: {
						display: false,
					},
				},
				y: {
					stacked: true,
					grid: {
						color: 'rgba(0, 0, 0, 0.1)',
					},
					beginAtZero: true
				},
			},
			plugins: {
				legend: {
					display: false,
				},
				zoom: {
					zoom: {
						wheel: {
							enabled: true,
						},
						pinch: {
							enabled: true,
						},
						mode: 'x'
					},
				},
			},
		},
	};

	new Chart(activityChartElem, chartConfig);
}
  
async function getModlog() {
	const data = await fetchWikiDatabase(modlogURL);
	
	const gridData = data.map(obj => {
		let action = obj?.action;

		const sourceUser = obj?.source_user?.replace('u/', '');
		const sourcePermalink = obj?.source_permalink;

		const targetUser = obj?.target_user?.replace('u/', '');
		const targetPermalink = obj?.target_permalink;

		const datetime = obj?.datetime + '+02:00';

		const secondsPassed = calcSecondsPassedFromDateStr(datetime);

		const date = new Date(datetime);
		const unixDate = date.getTime();

		const stylizedDate = `<span data-unix="${unixDate}" title="${secondsToReadableForm(secondsPassed) + ' ago'}">${formatToFinnishDateTime(date)}</span>`;

		const actionQuery = `action-${action?.toLowerCase()?.replaceAll(' ', '-')}-text`;
		const stylizedAction = `<span class="modlog-action ${actionQuery}">${action}</span>`;

		const sourceUserLink = formatToHtmlRedditLink(formatToRedditUserURL(sourceUser, true), sourceUser, 'User Profile Link');
		const targetUserLink = formatToHtmlRedditLink(formatToRedditUserURL(targetUser, true), targetUser, 'User Profile Link');

		const sourceSubmissionLink = `<sup>${formatToHtmlRedditLink(sourcePermalink, '(s)', 'Submission Permalink')}</sup>`;
		const targetSubmissionLink = `<sup>${formatToHtmlRedditLink(targetPermalink, '(s)', 'Submission Permalink')}</sup>`;

		const source = sourcePermalink ? `${sourceUserLink} ${sourceSubmissionLink}` : sourceUserLink;
		const target = `${targetUserLink} ${targetSubmissionLink}`;

		return [ stylizedAction, target, source, stylizedDate ];
	}).reverse();

	return { data, gridData };
}

async function load() {
	const modlog = await getModlog();

	new gridjs.Grid({
		columns: [
			{ name: 'Action', formatter: cell => gridjs.html(cell) },
			{ name: 'Target', formatter: cell => gridjs.html(cell) },
			{ name: 'Initiator', formatter: cell => gridjs.html(cell) },
			{ 
				name: 'Date & Time',
				formatter: cell => gridjs.html(cell),
				sort: {
					compare: (a, b) => gridCustomCompareSort(a, b, elem => {
						return elem.querySelector('span[data-unix]')?.dataset?.unix;
					})
				}
			}
		],
		data: modlog.gridData, // could use await directly here to display a neat loading and failure indicator, however Grid.js makes 10 extra requests (Bug - 27/06/2023)
		search: true,
		resizable: true,
		sort: true
	}).render(document.querySelector('#modlog-table'));

	displayGraph(modlog.data);
}

load();
