# Conjure

[![License: MIT][license-image]][license-url]
[![Changelog][changelog-image]][changelog-url]
[![NPM version][npm-image]][npm-url]
[![Test Status][test-image]][test-url]

🪄 Conjure images, icons and favicons for your frontend project.

<picture>
	<source srcset="https://raw.githubusercontent.com/firefoxic/conjure/main/example/dark.webp" media="(prefers-color-scheme: dark)">
	<img src="https://raw.githubusercontent.com/firefoxic/conjure/main/example/light.webp" alt="Example showing the source files, and the files after running the 'conjure all -r -m' command.">
</picture>

## Purpose

In most frontend projects, you have to perform the same and rather boring actions with images between exporting them from Figma and deploying the project to the server. Spare yourself from this routine!

Conjure is a command line utility for optimizing vector images, converting raster images to modern formats for different pixel densities and also preparing favicons.

## Installation

To install Conjure, you need to have Node.js installed on your machine. Then you can install in your project using _pnpm_ (for _npm_, just remove the first `p`):

```shell
pnpm add @firefoxic/conjure -D
```

or globally

```shell
pnpm add @firefoxic/conjure -g
```

## Usage

Conjure is invoked via the command line:

- with globally installation:

	```shell
	conjure <command> [options]
	```

- with locally installation (in a project):

	```shell
	pnpm exec conjure <command> [options]
	```

- without installation:

	```shell
	pnpm dlx @firefoxic/conjure <command> [options]
	```

### Commands

- `images` — Optimize SVGs and convert raster images to modern formats (Avif and Webp by default).
- `icons` — Optimize SVG icon files.
- `favicons` — Convert the original SVG favicons (expect at least one of `touch.svg`, `32.svg`, and `16.svg`) to optimized vector and all raster favicons, including ICO format and necessary PNG and Webp, and also generate a webmanifest (read [this article about favicons](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs) by Andrey Sitnik).
- `all` — Run all the above commands.

	> **Notice**: Individual commands handle the contents of the specified directory. But the general `all` command expects the path to the directory containing the `images`, `icons` and `favicons` directories (see [examples](#examples) below).

### Options

#### `-i`, `--inputDirectory`

- _Type:_ `String`
- _Default:_ `src/shared`
- _Description:_ Path to the directory containing raw files

#### `-o`, `--outputDirectory`

- _Type:_ `String`
- _Default:_ the value of `--inputDirectory`
- _Description:_ Path to the directory where processed files will be placed

#### `-p`, `--publicDirectory`

- _Type:_ `String`
- _Default:_ `public`
- _Description:_ Path to the directory with the static assets (e.g. favicons)

#### `-d`, `--originDensity`

- _Type:_ `Number`
- _Default:_ `2`
- _Description:_ Pixel density in dppx of the raw raster images

#### `-f`, `--targetFormats`

- _Type:_ `String`
- _Default:_ `avif,webp`
- _Description:_ Comma-separated list of formats for output raster images

#### `-a`, `--addOriginFormat`

- _Type:_ `Boolean`
- _Default:_ `false`
- _Description:_ Add the original raster format to the list of output formats

#### `-r`, `--removeOrigin`

- _Type:_ `Boolean`
- _Default:_ `false`
- _Description:_ Remove the original raster files after successful processing

#### `-m`, `--addMetaData`

- _Type:_ `Boolean`
- _Default:_ `false`
- _Description:_ Create JSON and JS files with metadata of the raster images

> #### Note: Don’t forget to specify the `-m` flag
>
> When processing raster images, the `-m` (`--addMetaData`) flag enables generation of metadata files in JSON and JS formats. Metadata files are convenient for generating the `picture` tag. For macro of templating engines (like Nunjucks) a JSON file is more suitable. And for a component of frameworks (especially Vite-based frameworks such as Astro) JS file is more convenient, because its dynamic imports when building a project will trigger hashing of image files and return paths to new files.

### Examples

- In the `source/images` folder, optimize all SVGs and convert the raster images to `avif` and `webp` formats at the original size for `2x` pixel density and at a reduced size for `1x` pixel density; and after processing the raster images, delete their original files and generate JSON and JS files with metadata:

	```shell
	conjure images --inputDirectory=source/images --removeOrigin -m
	```

	> #### Tip for exporting raster layers from layouts
	>
	> If you have finally managed to give up old formats (such as JPG and PNG) and use only modern Avif and Webp, it is better to export raster layers from Figma only to PNG. JPG will only add artifacts on them. Avoid unnecessary quality loss.

- Take all vector and raster images from the `raws/images` folder; optimize vector images and put them in `source/images`; convert raster images to `webp` format and to the original format, optimizing them for `2x` and `1x` pixel densities, placing these results also in `source/images`; when processing is completed, delete the original raster images from `raws/images`:

	```shell
	conjure images -i raws/images -o source/images -f webp -a -r
	```

- Optimize SVG icons in the default `src/shared/icons` folder:

	```shell
	conjure icons
	```

- In the `assets` folder, convert files `touch.svg`, `32.svg` (and optionaly `16.svg`) to:
	- `favicon.ico` in size `32×32` (and optionaly with second layer in size `16×16`)
	- `favicons/icon.svg` — optimized version of `32.svg` (or `touch.svg` if `32.svg` and `16.svg` are missing)
	- `favicons/icon-180.png` in size `180×180` for old iPhones
	- `favicons/icon-192.png` and `favicons/icon-192.webp` in size `192×192`
	- `favicons/icon-512.png` and `favicons/icon-512.webp` in size `512×512`
	- `manifest.webmanifest` with the `name` and `description` fields from your `package.json` and the `icons` field for the `192` and `512` files
	- `Links.md` — advice on code of links for generated files, moving files, and fixing paths to files.

	```shell
	conjure favicons -p assets
	```

	> #### Recommendations for the source favicon files
	>
	> - The most optimal composition of source files is a couple of files:
	>	 - `32.svg` — the drawing is adjusted to a `32×32` pixel grid, may transparent areas such as rounded corners of the background;
	>	 - `touch.svg` — the drawing is prepared for large touch icons with solid background without rounding, with margins much larger than `32.svg`.
	> - If you don't have a variant specially prepared by the designer for the pixel grid size `16×16`, then don't create a file `16.svg` from variants of other sizes — it will only increase the weight of the final `favicon.ico`.
	> - If you don't have a `32×32` variant, but you have a `16×16` variant, there is no need to make a `32.svg` file, `conjure` will make all the variants for you.
	> - If you have only one variant and it's not `16×16`, it doesn't matter what you name the file, `32.svg` or `touch.svg` (as long as it's not `16.svg`) — a file with either of these two names will be used by `conjure` to generate the entire set of favicons.

- Run all three special commands with default settings, but deleting the original raster images, i.e.:
	- run `conjure images` in the `src/shared/images` folder with deleting the original raster images and generating JSON and JS files with metadata,
	- run `conjure icons` in the `src/shared/icons` folder,
	- run `conjure favicons` in the `public` folder,

	```shell
	conjure all -r -m
	```

[license-url]: https://github.com/firefoxic/conjure/blob/main/LICENSE.md
[license-image]: https://img.shields.io/badge/License-MIT-limegreen.svg

[changelog-url]: https://github.com/firefoxic/conjure/blob/main/CHANGELOG.md
[changelog-image]: https://img.shields.io/badge/CHANGELOG-md-limegreen

[npm-url]: https://npmjs.org/package/@firefoxic/conjure
[npm-image]: https://badge.fury.io/js/@firefoxic%2Fconjure.svg

[test-url]: https://github.com/firefoxic/conjure/actions
[test-image]: https://github.com/firefoxic/conjure/actions/workflows/test.yml/badge.svg?branch=main
