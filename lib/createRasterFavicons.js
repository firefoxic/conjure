import { cwd } from "node:process"
import { error } from "node:console"
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import { normalize, resolve } from "node:path"

import sharp from "sharp"

/**
 * Function to generate raster favicons from a vector icon file.
 *
 * @param {Object} options - Options for generating raster favicons.
 * @param {string} options.outputDirectory - Path to the directory where processed files will be placed.
 * @param {string} options.touchIcon - Path to vector touch icon files.
 */
export async function createRasterFavicons ({ outputDirectory, touchIcon }) {
	const fileNamePrefix = `icon-`
	const rootRelativePath = outputDirectory.split(`/`).slice(1).join(`/`)

	const sizes = [180, 192, 512]
	const formats = [`png`, `webp`]
	let icons = []

	try {
		await access(outputDirectory)
	} catch {
		await mkdir(outputDirectory, { recursive: true })
	}

	for (const format of formats) {
		for (const size of sizes) {
			if (format === `webp` && size === 180) continue

			try {
				const image = sharp(touchIcon)
					.resize(size)
					.toFormat(format, { lossless: true })

				const outputPath = resolve(outputDirectory, `${fileNamePrefix}${size}.${format}`)

				await image.toFile(outputPath)
			} catch (err) {
				error(`Error processing ${touchIcon}:`, err)
			}

			if (size === 180) continue

			icons.push({
				src: `./${normalize(`${rootRelativePath}/${fileNamePrefix}${size}.${format}`)}`,
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

	const webmanifest = {
		...(packageInfo.name && { name: packageInfo.name }),
		...(packageInfo.description && { description: packageInfo.description }),
		icons,
	}

	const webmanifestPath = resolve(outputDirectory, `manifest.webmanifest`)

	try {
		await writeFile(webmanifestPath, `${JSON.stringify(webmanifest, null, `\t`)}\n`)
	} catch (err) {
		error(`Error writing manifest.webmanifest file:`, err)
	}
}
