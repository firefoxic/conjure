import { error } from "node:console"
import { resolve } from "node:path"
import { writeFile } from "node:fs/promises"

import icoEndec from "ico-endec"
import sharp from "sharp"

/**
 * Convert SVG icons to ICO format and save the result to disk.
 *
 * @param {Object} options - Options for the conversion.
 * @param {string} options.publicDirectory - Directory where the resulting ICO file will be saved.
 * @param {string} options.ico32 - Path to the 32x32 SVG icon.
 * @param {string|undefined} options.ico16 - Path to the 16x16 SVG icon (optional).
 * @returns {Promise<void>} Promise that resolves when the conversion is complete.
 */
export async function convertSvgToIco ({ publicDirectory, ico32, ico16 }) {
	try {
		let pngBuffer = [await sharp(ico32).resize(32, 32).png().toBuffer()]

		if (ico16) pngBuffer.push(await sharp(ico16).resize(16, 16).png().toBuffer())

		let destPath = resolve(publicDirectory, `favicon.ico`)
		let destData = icoEndec.encode(pngBuffer)

		await writeFile(destPath, destData)
	} catch (err) {
		error(`Error processing favicon.ico:`, err)
	}
}
