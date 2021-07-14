'use strict';

const fs = require('fs');
const path = require('path');
const boxen = require('boxen');
const chalk = require('chalk');
const stringWidth = require('string-width');
const widestLine = require('widest-line');
const config = require('./config.json');
const pkg = require('./package.json');

const boxenOptions = {
	padding: 1,
	margin: 1,
	borderStyle: 'round'
};

const packageName = pkg.name;
const packageAuthor = pkg.author.name;

const services = {
	github: {
		prefix: 'https://github.com/',
		color: 'green'
	},
	keybase: {
		prefix: 'https://keybase.io/',
		color: 'blue'
	},
	linkedin: {
		prefix: 'https://linkedin.com/in/',
		color: 'blue'
	},
	npm: {
		prefix: 'https://www.npmjs.com/',
		color: 'red'
	},
	twitter: {
		prefix: 'https://twitter.com/',
		color: 'cyan'
	},
	web: {
		prefix: '',
		color: 'cyan'
	}
};

const getMaxLabelLength = (labels) => {
	return widestLine(labels.join('\n'));
};

const formatValue = (service, value) => {
	service = service.toLowerCase();

	if (!(service in services)) {
		return value;
	}

	const { prefix, color } = services[service];
	return `${chalk.gray(prefix)}${chalk[color](value)}`;
};

const formatLine = (label, value, labelWidth) => {
	const paddedLabel = `${label.padStart(labelWidth, ' ')}:`;
	const formattedValue = formatValue(label, value);
	return chalk`{white.bold ${paddedLabel}} {white ${formattedValue}}`;
};

const formatAuthorLine = (authorLine, content) => {
	const lineWidth = widestLine(content);
	const authorWidth = stringWidth(authorLine);

	const paddingWidth = Math.floor((lineWidth - authorWidth) / 2);
	const padding = new Array(paddingWidth);

	return `${padding.join(' ')}${authorLine}`;
};

(() => {
	const maxLabelLength = getMaxLabelLength([
		...Object.keys(config.meta || {}),
		...Object.keys(config.links || {}),
		'npx'
	]);

	const meta = Object.entries(config.meta).map(([label, value]) => {
		return formatLine(label, value, maxLabelLength);
	});

	const links = Object.entries(config.links).map(([label, value]) => {
		return formatLine(label, value, maxLabelLength);
	});

	const sections = [
		meta.join('\n'),
		links.join('\n'),
		formatLine('Card', chalk`{red npx} {white ${packageName}}`, maxLabelLength)
	];

	const sectionContent = sections.join('\n\n');

	const authorLine = chalk`{white ${packageAuthor}} / {white ${packageName}}\n`;
	const formattedAuthorLine = formatAuthorLine(authorLine, sectionContent);

	const boxContent = `${formattedAuthorLine}\n${sectionContent}`;
	const boxed = chalk`{green ${boxen(boxContent, boxenOptions)}}`;

	fs.writeFileSync(path.join(__dirname, 'bin/output'), boxed);
})();
