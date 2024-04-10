import { error } from "node:console"
import { basename, dirname, extname, join, resolve } from "node:path"
import { mkdir, writeFile } from "node:fs/promises"

import icoEndec from "ico-endec"
import sharp from "sharp"

const ICO_SIZE = 32

/**
 * Converts SVG files to ICO format.
 *
 * @param {Object} options - The options for the conversion.
 * @param {Array} options.vectorPaths - The paths to the SVG files.
 * @param {string} options.inputDirectory - The directory containing the SVG files.
 * @param {string} options.outputDirectory - The directory to output the ICO files.
 */
export async function convertSvgToIco ({ vectorPaths, inputDirectory, outputDirectory }) {
	for (const filePath of vectorPaths) {
		try {
			const pngBuffer = await sharp(filePath)
				.resize(ICO_SIZE, ICO_SIZE)
				.png()
				.toBuffer()

			const destData = icoEndec.encode(pngBuffer)
			const subfolder = dirname(filePath.substring(inputDirectory.length))
			const destSubfolder = join(outputDirectory, subfolder)

			await mkdir(destSubfolder, { recursive: true })

			const fileName = basename(filePath, extname(filePath))
			const destPath = resolve(destSubfolder, `${fileName}.ico`)

			await writeFile(destPath, destData)
		} catch (err) {
			error(`Error processing ${filePath}:`, err)
		}
	}
}
