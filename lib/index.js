import { addPathsToOptions } from "./addPathsToOptions.js"
import { convertSvgToIco } from "./convertSvgToIco.js"
import { createLinksFile } from "./createLinksFile.js"
import { createRasterFavicons } from "./createRasterFavicons.js"
import { generateIconsCss } from "./generateIconsCss.js"
import { optimizeVector } from "./optimizeVector.js"
import { prepareSourceFaviconFiles } from "./prepareSourceFaviconFiles.js"
import { processRaster } from "./processRaster.js"
import { removeSourceFaviconFiles } from "./removeSourceFaviconFiles.js"

/**
 * Optimizes vector icons in the specified options.
 *
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 * @returns {Promise<void>} - A promise that resolves when the icons are optimized.
 */
export async function conjureIcons (options) {
	await addPathsToOptions(options)
	await generateIconsCss(options)
	await optimizeVector(options)
}

/**
 * Optimizes raster images in the specified options.
 *
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 * @returns {Promise<void>} - A promise that resolves when the images are optimized.
 */
export async function conjureImages (options) {
	await addPathsToOptions(options)
	await optimizeVector(options)
	await processRaster(options)
}

/**
 * Optimizes vector favicons in the specified options.
 *
 * @param {Object} options - The options object.
 * @returns {Promise<void>} - A promise that resolves when the favicons are optimized.
 */
export async function conjureFavicons (options) {
	await prepareSourceFaviconFiles(options)

	if (options.isSourceFaviconNotExists) return

	await createRasterFavicons(options)
	await convertSvgToIco(options)
	await optimizeVector(options)
	await createLinksFile(options)

	await removeSourceFaviconFiles(options)
}

/**
 * Optimizes all icons, favicons and images in the specified options.
 *
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 * @param {string} options.outputDirectory - The directory where processed files will be placed.
 * @returns {Promise<void>} - A promise that resolves when all the assets are optimized.
 */
export async function conjureAll (options) {
	let iconsOptions = prepareOptionsForCommand(`icons`)
	let imagesOptions = prepareOptionsForCommand(`images`)
	let faviconsOptions = prepareOptionsForCommand(`favicons`)

	await conjureIcons(iconsOptions)
	await conjureImages(imagesOptions)
	await conjureFavicons(faviconsOptions)

	/**
	 * Prepare options for a specific command
	 *
	 * @param {string} command - The command to determine which type of images to search for.
	 * @returns {Object} - The options object with input and output directories set for the specific command.
	 */
	function prepareOptionsForCommand (command) {
		let opts = { ...options }

		opts.command = command
		opts.inputDirectory = `${options.inputDirectory}/${command}`
		opts.outputDirectory = `${options.outputDirectory}/${command}`

		return opts
	}
}
