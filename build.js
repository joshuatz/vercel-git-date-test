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
	const fileListDeploy = execWithDir(`ls -a`);
	const fileListRoot = execWithDir(`ls -a`, rootDir);
	const gitLog = getGitLog();
	const commitCount = execWithDir(`git rev-list --count HEAD`);
	const remotesList = execWithDir(`git remote -v`);
	const currBranch = execWithDir(`git symbolic-ref --short HEAD`) || execWithDir(`git rev-parse --abbrev-ref HEAD`);
	console.log(execWithDir(`git branch -vv`));
	const allBranches = execWithDir(`git branch`);
	const changedFiles = execWithDir(`git show HEAD --name-only --format=%b`);
	// Curious if this will work
	const commits = {
		last: execWithDir(`git show -s HEAD`),
		secondToLast: execWithDir(`git show -s HEAD~1`),
		thirdToLast: execWithDir(`git show -s HEAD~2`)
	};
	const buildDebugInfo = {
		fileListDeploy,
		fileListRoot,
		gitLog,
		commitCount,
		remotesList,
		currBranch,
		allBranches,
		commits,
		changedFiles
	};
	console.log(JSON.stringify(buildDebugInfo, null, 4));
	fs.writeFileSync('./public/build-debug.txt', JSON.stringify(buildDebugInfo));
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
