import { error } from "node:console"

import { globby } from "globby"

import { convertSvgToIco } from "./convertSvgToIco.js"
import { createRasterFavicons } from "./createRasterFavicons.js"
import { optimizeVector } from "./optimizeVector.js"
import { processRaster } from "./processRaster.js"

const RASTER_EXTNAMES = `{jpg,jpeg,png,webp,avif,gif,tiff}`
const VECTOR_EXTNAMES = `svg`

async function getFilePaths ({ inputDirectory }, extnames) {
	return await globby(`${inputDirectory}/**/*.${extnames}`, {
		ignore: extnames === RASTER_EXTNAMES ? [`**/*@[1-9]x.*`] : [],
	})
}

async function addPathsToOptions (options) {
	options.vectorPaths = await getFilePaths(options, VECTOR_EXTNAMES)
	options.rasterPaths = options.command === `images` ? await getFilePaths(options, RASTER_EXTNAMES) : []
}

export async function conjureIcons (options) {
	await addPathsToOptions(options)
	await optimizeVector(options)
}

export async function conjureFavicons (options) {
	await addPathsToOptions(options)
	await createRasterFavicons(options)
	await convertSvgToIco(options).catch(error)
	await optimizeVector(options)
}

export async function conjureImages (options) {
	await addPathsToOptions(options)
	await optimizeVector(options)
	await processRaster(options)
}

export async function conjureAll (options) {
	await conjureIcons(prepareOptionsForCommand(`icons`))
	await conjureFavicons(prepareOptionsForCommand(`favicons`))
	await conjureImages(prepareOptionsForCommand(`images`))

	function prepareOptionsForCommand (command) {
		let opts = { ...options }

		opts.command = command
		opts.inputDirectory = `${options.inputDirectory}/${command}`
		opts.outputDirectory = `${options.outputDirectory}/${command}`

		return opts
	}
}
