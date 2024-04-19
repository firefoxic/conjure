import { unlink } from "node:fs/promises"

/**
 * Remove source the source files used for favicon generation, if the `removeOrigin` option is truthy.
 *
 * @param {Object} options - The options for removing the source files.
 * @param {boolean} options.removeOrigin - Indicates if the source files should be removed.
 * @param {string} options.inputDirectory - The input directory for the source files.
 * @param {string} options.outputDirectory - The output directory for the favicon files.
 * @param {string} options.ico16 - The path to the 16px icon.
 * @param {string} options.ico32 - The path to the 32px icon.
 * @param {string} options.touchIcon - The path to the touch icon.
 * @param {Array<string>} options.vectorPaths - The paths to the vector icons.
 * @return {Promise<void>} - A promise that resolves when the source files are removed.
 */

export async function removeSourceFaviconFiles (options) {
	if (!options.removeOrigin) return
	if (options.outputDirectory !== options.inputDirectory) await unlink(options.vectorPaths[0])
	if (options.ico16) await unlink(options.ico16)
	await unlink(options.ico32)
	await unlink(options.touchIcon)
}
