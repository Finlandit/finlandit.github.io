const redditURL = 'https://www.reddit.com';
const subredditWikiURL = redditURL + '/r/Finland/wiki';

const getURL = type => `${subredditWikiURL}/vainamoinen/${type}/.json`;

const modlogURL = getURL('bot_log');
const banlistURL = getURL('ban_list');
const cooldownlistURL = getURL('cooldown_list');
const leaderboardURL = getURL('user_scores');

function getSumOfArr(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

function gridCustomCompareSort(a, b, getElemNumber) {
	const aElem = document.createElement('div');
		  aElem.innerHTML = a;

	const bElem = document.createElement('div');
		  bElem.innerHTML = b;

	const aNum = Number(getElemNumber(aElem));
	const bNum = Number(getElemNumber(bElem));

	if (aNum > bNum) {
		return 1;
	} else if (bNum > aNum) {
		return -1;
	} else {
		return 0;
	}
}

function capitalize(s){
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
}

function formatToRedditUserURL(username, cut) {
	return (cut ? '' : redditURL) + `/u/${username}`;
}

function formatToHtmlRedditLink(url, text, title) {
	return `<a href="${redditURL}${url}" title="${title}" target="_blank">${text}</a>`;
}

async function fetchWikiDatabase(url) {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();
		const jsonString = data?.data?.content_md;

		const parsedData = JSON.parse(jsonString);
		
		return parsedData;
	} catch (error) {
		console.error("Error:", error);
	}
}

function formatToFinnishDateTime(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
  
    return `${day}.${month}. ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}

function calcSecondsPassedFromDateStr(str) {
    const date = new Date(str);

    const currentTime = new Date();
    const timeDiff = currentTime - date;
    const secondsPassed = Math.floor(timeDiff / 1000);

    return secondsPassed;
}

function secondsToReadableForm(totalSeconds, fullDetail) {
    totalSeconds = totalSeconds.toFixed(0);

    const years = Math.floor(totalSeconds / (60 * 60 * 24 * 30 * 12)) % 365;
    const months = Math.floor(totalSeconds / (60 * 60 * 24 * 30)) % 12;
    const days = Math.floor(totalSeconds / (60 * 60 * 24)) % 30;
    const hours = Math.floor(totalSeconds / 60 / 60) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;

    const readableFormObj = {};

    if(years) readableFormObj.year = years;
    if(months) readableFormObj.month = months;
    if(days) readableFormObj.day = days;
    if(hours) readableFormObj.hour = hours;
    if(minutes) readableFormObj.minute = minutes;
    if(seconds) readableFormObj.second = seconds;

    let finalReadableForm = '';

    const keys = Object.keys(readableFormObj);
    
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const isLastItem = i === keys.length - 1;
        const isFirstItem = i === 0;
    
        let prefix = '';
    
        if ((!fullDetail || isLastItem) && !isFirstItem) {
            prefix = ' and ';
        } else if (!isFirstItem) {
            prefix = ' ';
        }
    
        const value = readableFormObj[key];
        finalReadableForm += `${prefix}${value} ${key + (value > 1 ? 's' : '')}`;
    
        if (!fullDetail && i == 1) {
            break;
        }
    }

    return finalReadableForm;
}