import { basename, dirname, extname, join, resolve } from "node:path"
import { error, info } from "node:console"
import { mkdir, rm } from "node:fs/promises"

import sharp from "sharp"

/**
 * Processes a list of raster images, resizing them and converting them to different formats. Optionally, removes the original image.
 *
 * @param {Object} options - The options for processing the raster images.
 * @param {Array} options.rasterPaths - The list of paths to the raster images.
 * @param {string} options.inputDirectory - The directory containing the raster images.
 * @param {string} options.outputDirectory - The directory where processed images will be placed.
 * @param {Array} options.targetFormats - The list of formats for the output images.
 * @param {boolean} options.addOriginFormat - Whether to add the format of the original image.
 * @param {number} options.originDensity - The pixel density of the original image.
 * @param {boolean} options.removeOrigin - Whether to remove the original image.
 */
export async function processRaster (options) {
	const {
		rasterPaths,
		inputDirectory,
		outputDirectory,
		targetFormats,
		addOriginFormat,
		originDensity,
		removeOrigin,
	} = options

	if (rasterPaths.length === 0) return

	info(`Conjuring raster images, please wait...\n`)

	for (const filePath of rasterPaths) {
		const fileName = basename(filePath, extname(filePath))
		const baseName = basename(fileName, extname(fileName))
		const subfolder = dirname(filePath.substring(inputDirectory.length))
		const destSubfolder = join(outputDirectory, subfolder)

		try {
			await mkdir(destSubfolder, { recursive: true })
		} catch (err) {
			if (err.code !== `EEXIST`) throw err
		}

		let formats = targetFormats

		if (addOriginFormat) formats = [...new Set([extname(filePath).slice(1), ...targetFormats])]

		for (const format of formats) {
			for (let dppx = originDensity; dppx > 0; dppx--) {
				const destPath = join(destSubfolder, `${baseName}@${dppx}x.${format}`)

				info(` 🪄  ${destPath}`)

				try {
					const { width } = await sharp(filePath).metadata()

					await sharp(filePath)
						.resize(Math.ceil(width * dppx / originDensity))
						.toFormat(format)
						.toFile(resolve(destPath))
				} catch (err) {
					error(err)
				}
			}
		}

		if (removeOrigin) {
			await rm(filePath)
			info(`Removed file: ${filePath}\n`)
		}
	}

	info(`Complete ✨\n`)
}
