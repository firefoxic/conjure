import { cwd } from "node:process"
import { error } from "node:console"
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import { posix, resolve } from "node:path"

import sharp from "sharp"

/**
 * Function to generate raster favicons from a vector icon file.
 *
 * @param {Object} options - Options for generating raster favicons.
 * @param {string} options.publicDirectory - Path to the public directory.
 * @param {string} options.touchIcon - Path to vector touch icon files.
 */
export async function createRasterFavicons ({ publicDirectory, touchIcon }) {
	let fileNamePrefix = `icon-`

	let sizes = [180, 192, 512]
	let formats = [`png`, `webp`]
	let icons = []
	let iconDirectory = `${publicDirectory}/favicons`

	try {
		await access(iconDirectory)
	} catch {
		await mkdir(iconDirectory, { recursive: true })
	}

	for (let format of formats) {
		for (let size of sizes) {
			if (format === `webp` && size === 180) continue

			try {
				let image = sharp(touchIcon)
					.resize(size)
					.toFormat(format, { lossless: true })

				let outputPath = resolve(iconDirectory, `${fileNamePrefix}${size}.${format}`)

				await image.toFile(outputPath)
			} catch (err) {
				error(`Error processing ${touchIcon}:`, err)
			}

			if (size === 180) continue

			icons.push({
				src: `./${posix.normalize(`favicons/${fileNamePrefix}${size}.${format}`)}`,
				sizes: `${size}x${size}`,
				type: `image/${format}`,
			})
		}
	}

	let packageInfo = {}

	try {
		packageInfo = JSON.parse(await readFile(resolve(cwd(), `package.json`), `utf8`))
	} catch (err) {
		error(`Error reading package.json:`, err)
	}

	let webmanifest = {
		...(packageInfo.name && { name: packageInfo.name }),
		...(packageInfo.description && { description: packageInfo.description }),
		icons,
	}

	let webmanifestPath = resolve(publicDirectory, `manifest.webmanifest`)

	try {
		await writeFile(webmanifestPath, `${JSON.stringify(webmanifest, null, `\t`)}\n`)
	} catch (err) {
		error(`Error writing manifest.webmanifest file:`, err)
	}
}
