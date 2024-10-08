import { globby } from "globby"

const RASTER_EXTNAMES = `{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF,gif,GIF,tiff,TIFF}`
const VECTOR_EXTNAMES = `{svg,SVG}`

/**
 * Adds the file paths for vector and raster images to the options object.
 *
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 * @param {string} options.command - The command to determine which type of images to search for.
 */
export async function addPathsToOptions (options) {
	options.vectorPaths = await getFilePaths(options, VECTOR_EXTNAMES)
	options.rasterPaths = options.command === `images` ? await getFilePaths(options, RASTER_EXTNAMES) : []
}

/**
 * Retrieves the file paths from the specified directory that match the given extensions.
 *
 * @param {Object} options - The options object.
 * @param {string} options.inputDirectory - The directory to search for files.
 * @param {string} extnames - The file extensions to match.
 * @returns {Promise<Array>} - A promise that resolves to an array of file paths.
 */
async function getFilePaths ({ inputDirectory }, extnames) {
	return await globby(`${inputDirectory}/**/*.${extnames}`, {
		ignore: extnames === RASTER_EXTNAMES ? [`**/*@[1-9]x.*`] : [],
	})
}
