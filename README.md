# Conjure

Conjure images, icons and favicons for your frontend project.

## Purpose

In most frontend projects, you have to perform the same and rather boring actions with images between exporting them from Figma and deploying the project to the server. Spare yourself from this routine!

Conjure is a command line utility for optimizing vector images, converting raster images to modern formats for different pixel densities and also preparing favicons.

## Installation

To install Conjure, you need to have Node.js installed on your machine. You can then install it via _npm_ or _pnpm_ in your project (or globally, then replace `-D` flag with `-g`):

```shell
npm add @firefoxic/conjure -D
# or
pnpm add @firefoxic/conjure -D
```

## Usage

Conjure is invoked via the command line:

```shell
conjure <command> [options]
```

### Commands

- `images` — Optimize SVGs and convert raster images to modern formats (Webp and Avif by default).
- `icons` — Optimize SVG icon files.
- `favicons` — Optimize SVG favicon and generate from it raster favicons, including ICO format and all necessary PNG and Webp, and also generate a webmanifest (read [this article about favicons](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs) by Andrey Sitnik).
- `all` — Run all the above commands.

	> **Notice**: Individual commands handle the contents of the specified directory. But the general `all` command expects the path to the directory containing the `images`, `icons` and `favicons` directories (see [examples](#examples) below).

### Options

| Short | Long                | Type      | Default       | Description                                                  |
|-------|---------------------|-----------|---------------|--------------------------------------------------------------|
| `-i`  | `--inputDirectory`  | `String`  | `src/shared`  | Path to the directory containing raw files                   |
| `-o`  | `--outputDirectory` | `String`  | value of `-i` | Path to the directory where processed files will be placed   |
| `-d`  | `--originDensity`   | `Number`  | `2`           | Pixel density in dppx of the raw raster images               |
| `-f`  | `--targetFormats`   | `String`  | `webp,avif`   | Comma-separated list of formats for output raster images     |
| `-a`  | `--addOriginFormat` | `Boolean` | `false`       | Add the original raster format to the list of output formats |
| `-r`  | `--removeOrigin`    | `Boolean` | `false`       | Remove the original raster files after successful processing |

### Examples

- In the `source/images` folder, optimize all SVGs and convert the raster images to `webp` and `avif` formats at the original size for `2x` pixel density and at a reduced size for `1x` pixel density; and after processing the raster images, delete their original files:

	```shell
	conjure images --inputDirectory=source/images --removeOrigin
	```

- Take all vector and raster images from the `raws/images` folder; optimize vector images and put them in `source/images`; convert raster images to `webp` format and to the original format, optimizing them for `2x` and `1x` pixel densities, placing these results also in `source/images`; when processing is completed, delete the original raster images from `raws/images`:

	```shell
	conjure images -i raws/images -o source/images -f webp -a -r
	```

- Optimize SVG icons in the default `src/shared/icons` folder:

	```shell
	conjure icons
	```

- In the `assets/favicons` folder, optimize each SVG file and create the following files for each SVG:
	- `<origin_name>.ico` in size `32×32`
	- `<origin_name>-180.png` in size `180×180` for old iPhones
	- `<origin_name>-192.png` and `<origin_name>-192.webp` in size `192×192`
	- `<origin_name>-512.png` and `<origin_name>-512.webp` in size `512×512`
	- `<origin_name>.webmanifest` with the `name` and `description` fields from your `package.json` and the `icons` field for the `192` and `512` files

	```shell
	conjure favicons -i assets/favicons
	```

	Rename the resulting `ico` and `webmanifest` files and move them to the project directory, from where they will be moved to the root of the server. The default paths in `webmanifest` are formed with the expectation that the `webmanifest` file will be moved to the root of the project source. In any case, double-check these paths to make sure they match the file structure of your project.

- Run all three special commands with default settings, but deleting the original raster images, i.e.:
	- run `conjure images` in the `rc/shared/images` folder with deleting the original raster images,
	- run `conjure icons` in the ``src/shared/icons` folder,
	- run `conjure favicons` in the ``src/shared/favicons` folder,

	```shell
	conjure all -r
	```

> **Tip**: If you have finally managed to give up old formats (such as JPG and PNG) and use only modern Webp and Avif, it is better to export raster layers from Figma only to PNG. JPG will only add artifacts on them. Avoid unnecessary quality loss.

## License

This project is licensed under the MIT License — see the [LICENSE.md](./LICENSE.md) file for details.
