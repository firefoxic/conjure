import { unlink } from "node:fs/promises"

/**
 * Remove the source files used for favicon generation.
 *
 * @param {Object} options - The options for removing the source files.
 * @param {string} options.ico16 - The path to the 16px icon.
 * @param {string} options.ico32 - The path to the 32px icon.
 * @param {string} options.touchIcon - The path to the touch icon.
 * @return {Promise<void>} - A promise that resolves when the source files are removed.
 */

export async function removeSourceFaviconFiles (options) {
	if (options.ico16) await unlink(options.ico16)
	await unlink(options.ico32)
	await unlink(options.touchIcon)
}
