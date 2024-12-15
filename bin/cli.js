#!/usr/bin/env node

import meow from "meow"

import { conjureAll, conjureFavicons, conjureIcons, conjureImages } from "../lib/index.js"

let cli = meow(`
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

    --input-directory   -i  Path to the directory containing raw files.
                            (Default: src/shared/<command>)

    --output-directory  -o  Path to the directory where processed files will be placed.
                            (Default: value of --inputDirectory)

    --public-directory  -p  Path to the directory with the static assets (e.g. favicons).
                            (Default: public)

    --origin-density    -d  Pixel density in dppx of the raw raster images.
                            0 means 1, but without adding the density suffix to the filename.
                            (Default: 2)

    --target-format     -f  Output raster image format.
	                        To specify multiple formats, specify an option for each.
                            (Default: ["avif", "webp"])

    --add-origin-format -a  Add the original raster format to the list of output formats.
                            (Default: false)

    --remove-origin     -r  Remove the original raster files after successful processing.
                            (Default: false)

    --add-meta-data     -m  Create JSON and JS files with metadata of the raster images
	                        and CSS file for the icons.
                            (Default: false)

    --version               Print version and exit

    --help                  Print this help and exit

  Examples

    $ conjure images --inputDirectory=source/images --removeOrigin -m
    $ conjure images -i raws/images -o source/images -f webp -a -r
    $ conjure icons
    $ conjure favicons -p assets/favicons
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
		publicDirectory: {
			"type": `string`,
			"shortFlag": `p`,
			"default": `public`,
		},
		originDensity: {
			"type": `number`,
			"shortFlag": `d`,
			"default": 2,
		},
		targetFormats: {
			"type": `string`,
			"shortFlag": `f`,
			"default": [`avif`, `webp`],
			"isMultiple": true,
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

let [command] = cli.input

let options = { command, ...cli.flags }

if (!(`inputDirectory` in cli.flags)) {
	options.inputDirectory = `src/shared${command === `all` ? `` : `/${command}`}`
}

if (!(`outputDirectory` in cli.flags)) {
	options.outputDirectory = options.inputDirectory
}

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
