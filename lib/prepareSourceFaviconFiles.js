import { normalize } from "node:path"
import { link, unlink } from "node:fs/promises"

/**
 * Prepares source files for favicon generation.
 *
 * @param {Object} options - The options for preparing the source files.
 * @param {string} options.inputDirectory - The input directory for the source files.
 * @param {Array<string>} options.vectorPaths - The paths to the vector icons.
 * @returns {Promise<void>} - A promise that resolves when the source files are prepared.
 */
export async function prepareSourceFaviconFiles (options) {
	const { inputDirectory, vectorPaths } = options

	const pathTo32 = normalize(`${inputDirectory}/32.svg`)
	const pathTo16 = normalize(`${inputDirectory}/16.svg`)
	const pathToTouch = normalize(`${inputDirectory}/touch.svg`)
	const pathToIcon = normalize(`${inputDirectory}/icon.svg`)

	const normalizedVectorPaths = vectorPaths.map((path) => normalize(path))

	const isIconTouchExists = normalizedVectorPaths.includes(pathToTouch)
	const isIcon32Exists = normalizedVectorPaths.includes(pathTo32)
	const isIcon16Exists = normalizedVectorPaths.includes(pathTo16)
	const isIconExists = normalizedVectorPaths.includes(pathToIcon)

	options.isSourceFaviconNotExists = !isIconTouchExists && !isIcon32Exists && !isIcon16Exists
	if (options.isSourceFaviconNotExists) return

	if (isIcon16Exists) options.ico16 = pathTo16
	options.ico32 = pathTo32
	options.touchIcon = pathToTouch
	options.vectorPaths = [pathToIcon]

	if (!isIcon32Exists) await link(isIcon16Exists ? pathTo16 : pathToTouch, pathTo32)
	if (!isIconTouchExists) await link(pathTo32, pathToTouch)

	if (isIconExists) await unlink(pathToIcon)
	await link(options.ico32, pathToIcon)
}

