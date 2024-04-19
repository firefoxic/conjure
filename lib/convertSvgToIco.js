import { error } from "node:console"
import { resolve } from "node:path"
import { access, mkdir, writeFile } from "node:fs/promises"

import icoEndec from "ico-endec"
import sharp from "sharp"

/**
 * Convert SVG icons to ICO format and save the result to disk.
 *
 * @param {Object} options - Options for the conversion.
 * @param {string} options.outputDirectory - Directory where the resulting ICO file will be saved.
 * @param {string} options.ico32 - Path to the 32x32 SVG icon.
 * @param {string|undefined} options.ico16 - Path to the 16x16 SVG icon (optional).
 * @returns {Promise<void>} Promise that resolves when the conversion is complete.
 */
export async function convertSvgToIco ({ outputDirectory, ico32, ico16 }) {
	try {
		await access(outputDirectory)
	} catch {
		await mkdir(outputDirectory, { recursive: true })
	}

	try {
		const pngBuffer = [await sharp(ico32).resize(32, 32).png().toBuffer()]

		if (ico16) pngBuffer.push(await sharp(ico16).resize(16, 16).png().toBuffer())

		const destPath = resolve(outputDirectory, `favicon.ico`)
		const destData = icoEndec.encode(pngBuffer)

		await writeFile(destPath, destData)
	} catch (err) {
		error(`Error processing favicon.ico:`, err)
	}
}
