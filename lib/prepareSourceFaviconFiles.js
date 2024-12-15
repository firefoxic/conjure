import { access, link, mkdir, unlink } from "node:fs/promises"
import { normalize } from "node:path"

import { globby } from "globby"

/**
 * Prepares source files for favicon generation.
 *
 * @param {Object} options - The options for preparing the source files.
 * @param {string} options.publicDirectory - The directory where the source files are located.
 * @returns {Promise<void>} - A promise that resolves when the source files are prepared.
 */
export async function prepareSourceFaviconFiles (options) {
	let { publicDirectory } = options

	let pathTo32 = normalize(`${publicDirectory}/32.svg`)
	let pathTo16 = normalize(`${publicDirectory}/16.svg`)
	let pathToTouch = normalize(`${publicDirectory}/touch.svg`)
	let pathToIcon = normalize(`${publicDirectory}/favicons/icon.svg`)

	let paths = await globby([pathTo32, pathTo16, pathToTouch, pathToIcon])

	let normalizedVectorPaths = paths.map((path) => normalize(path))

	let isIconTouchExists = normalizedVectorPaths.includes(pathToTouch)
	let isIcon32Exists = normalizedVectorPaths.includes(pathTo32)
	let isIcon16Exists = normalizedVectorPaths.includes(pathTo16)
	let isIconExists = normalizedVectorPaths.includes(pathToIcon)

	options.isSourceFaviconNotExists = !isIconTouchExists && !isIcon32Exists && !isIcon16Exists
	if (options.isSourceFaviconNotExists) return

	if (isIcon16Exists) options.ico16 = pathTo16
	options.ico32 = pathTo32
	options.touchIcon = pathToTouch
	options.vectorPaths = [pathToIcon]

	if (!isIcon32Exists) await link(isIcon16Exists ? pathTo16 : pathToTouch, pathTo32)
	if (!isIconTouchExists) await link(pathTo32, pathToTouch)

	if (isIconExists) await unlink(pathToIcon)

	let faviconsDirectory = normalize(`${publicDirectory}/favicons`)

	await access(faviconsDirectory).catch(() => mkdir(faviconsDirectory))
	await link(options.ico32, pathToIcon)
}
