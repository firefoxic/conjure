#!/usr/bin/env node

import meow from "meow"

import { conjureAll, conjureFavicons, conjureIcons, conjureImages } from "../lib/index.js"

const cli = meow(`
Usage
	$ conjure <command> [options]

Commands
	images
		Optimize SVGs and convert raster images to modern formats (Avif and Webp by default).

	icons
		Optimize SVG icon files.

	favicons
		Convert the original SVG favicons (expect at least one of touch.svg, 32.svg, and 16.svg) to optimized vector favicon and all raster favicons, including ICO format and necessary PNG and Webp, and also generate a webmanifest

	all
		Run all the above commands.
		Individual commands handle the contents of the specified directory. But the general all command expects the path to the directory containing the images, icons and favicons directories.


Options

	-i, --inputDirectory
		Type: String
		Default: src/shared/<command>
		Path to the directory containing raw files

	-o, --outputDirectory
		Type: String
		Default: value of --inputDirectory
		Path to the directory where processed files will be placed

	-d, --originDensity
		Type: Number
		Default: 2
		Pixel density in dppx of the raw raster images

	-f, --targetFormats
		Type: String
		Default: avif,webp
		Comma-separated list of formats for output raster images

	-a, --addOriginFormat
		Type: Boolean
		Default: false
		Add the original raster format to the list of output formats

	-r, --removeOrigin
		Type: Boolean
		Default: false
		Remove the original raster files after successful processing

	-m, --addMetaData
		Type: Boolean
		Default: false
		Create JSON and JS files with metadata of the raster images

Examples

	$ conjure images --inputDirectory=source/images --removeOrigin -m
	$ conjure images -i raws/images -o source/images -f webp -a -r
	$ conjure icons
	$ conjure favicons -i assets/favicons
	$ conjure all -r -m

`, {
	importMeta: import.meta,
	flags: {
		inputDirectory: {
			type: `string`,
			shortFlag: `i`,
		},
		outputDirectory: {
			type: `string`,
			shortFlag: `o`,
		},
		originDensity: {
			"type": `number`,
			"shortFlag": `d`,
			"default": 2,
		},
		targetFormats: {
			"type": `string`,
			"shortFlag": `f`,
			"default": `avif,webp`,
		},
		addOriginFormat: {
			"type": `boolean`,
			"shortFlag": `a`,
			"default": false,
		},
		removeOrigin: {
			"type": `boolean`,
			"shortFlag": `r`,
			"default": false,
		},
		addMetaData: {
			"type": `boolean`,
			"shortFlag": `m`,
			"default": false,
		},
	},
})

const [command] = cli.input

const options = { command, ...cli.flags }

if (!(`inputDirectory` in cli.flags)) {
	options.inputDirectory = `src/shared${command === `all` ? `` : `/${command}`}`
}

if (!(`outputDirectory` in cli.flags)) {
	options.outputDirectory = options.inputDirectory
}

options.targetFormats = options.targetFormats.split(`,`).map((format) => format.trim())

switch (command) {
	case `images`:
		await conjureImages(options)
		break
	case `icons`:
		await conjureIcons(options)
		break
	case `favicons`:
		await conjureFavicons(options)
		break
	case `all`:
		await conjureAll(options)
		break
	default:
		cli.showHelp()
		break
}
