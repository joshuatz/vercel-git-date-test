// @ts-check

const fs = require('fs');
const gitDateExtractor = require('git-date-extractor');
const childProc = require('child_process');

/** @param {string} [dir] */
const getGitLog = (dir) => {
	return execWithDir(`git log --pretty=fuller`, dir);
};

/**
 * @param {string} cmd
 * @param {string} [dir]
 * @returns {string} res
 */
const execWithDir = (cmd, dir) => {
	const opts = dir ? { cwd: dir } : {};
	try {
		const res = childProc.execSync(cmd, opts).toString();
		return res;
	} catch (e) {
		console.log(`Fatal error with exec:`, e.toString());
	}
};

const builder = async () => {
	const gitDates = await gitDateExtractor.getStamps({
		debug: true
	});
	if (!fs.existsSync('./public')) {
		fs.mkdirSync('./public');
	}
	if (fs.existsSync('/vercel')) {
		vercelBuildDebug();
	}
	fs.writeFileSync('./public/index.html', getTemplateHtml(gitDates));
};

const vercelBuildDebug = () => {
	const rootDir = `/vercel`;
	console.log(`ls -a`);
	console.log(getGitLog());
	console.log(getGitLog(rootDir));
	console.log(execWithDir(`git rev-list --count HEAD`));
	console.log(execWithDir(`git rev-list --count HEAD`, rootDir));
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
	<h2>Git Log: </h2>
	<pre>
	${getGitLog()}
	</pre>
	<h2>Stamps:</h2>
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
