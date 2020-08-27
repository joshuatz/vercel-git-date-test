// @ts-check

const fs = require('fs');
const gitDateExtractor = require('git-date-extractor');

const builder = async () => {
	const gitDates = await gitDateExtractor.getStamps({
		debug: true
	});
	if (!fs.existsSync('./public')) {
		fs.mkdirSync('./public');
	}
	fs.writeFileSync('./public/index.html', getTemplateHtml(gitDates));
};

/** @param {Record<string, any>} stampInfo */
const getTemplateHtml = (stampInfo) => {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset='utf-8'>
	<meta http-equiv='X-UA-Compatible' content='IE=edge'>
	<title>Git Date Extractor - Results</title>
	<meta name='viewport' content='width=device-width, initial-scale=1'>
</head>
<body>
	<pre>
	${JSON.stringify(stampInfo, null, '\t')}
	</pre>
</body>
</html>
`;
};

builder().then(() => {
	console.log('Build complete');
});
