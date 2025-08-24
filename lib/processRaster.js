import { error, info } from "node:console"
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { basename, dirname, extname, join, resolve } from "node:path"

import sharp from "sharp"

import { createProgressBar } from "./createProgressBar.js"

const UP_ONE_LINE = `\x1b[A`

/**
 * Processes a list of raster images, resizing them and converting them to different formats.
 * Optionally, removes the original image and creates JSON and JS files with metadata.
 *
 * @param {Object} options - The options for processing the raster images.
 * @param {Array} options.rasterPaths - The list of paths to the raster images.
 * @param {string} options.inputDirectory - The directory containing the raster images.
 * @param {string} options.outputDirectory - The directory where processed images will be placed.
 * @param {Array} options.targetFormats - The list of formats for the output images.
 * @param {boolean} options.addOriginFormat - Whether to add the format of the original image.
 * @param {number} options.originDensity - The pixel density of the original image.
 * @param {boolean} options.removeOrigin - Whether to remove the original image.
 * @param {boolean} options.addMetaData - Whether to create JSON and JS files with metadata of the images.
 */
export async function processRaster (options) {
	let {
		rasterPaths,
		inputDirectory,
		outputDirectory,
		targetFormats,
		addOriginFormat,
		originDensity: specifiedDensity,
		removeOrigin,
		addMetaData,
	} = options

	if (rasterPaths.length === 0) return

	let originDensity = specifiedDensity === 0 ? 1 : specifiedDensity
	let numberOutputFiles = rasterPaths.length * (targetFormats.length + (addOriginFormat ? 1 : 0)) * originDensity
	let messageStart = `🪄  Conjuring, please wait...`
	let messageEnd = `✨ Complete!`
	let progressBar = createProgressBar(numberOutputFiles, { messageStart, messageEnd })

	for (let filePath of rasterPaths) {
		let fileName = basename(filePath, extname(filePath))
		let baseName = basename(fileName, extname(fileName))
		let subfolder = dirname(resolve(filePath).substring(resolve(inputDirectory).length))
		let destSubfolder = join(outputDirectory, subfolder)

		try {
			await mkdir(destSubfolder, { recursive: true })
		} catch (err) {
			if (err.code !== `EEXIST`) throw err
		}

		let paths = []
		let sizes = []
		let formats = targetFormats

		if (addOriginFormat) formats = [...new Set([...targetFormats, extname(filePath).slice(1)])]

		let match = baseName.match(/^(.*?)(~(\d+))?$/)
		let imageName = match ? match[1] : baseName
		let metaFilePath = join(destSubfolder, `${imageName}.meta.json`)
		let importsFilePath = join(destSubfolder, `${imageName}.imports.js`)
		let isMetaFileExists = await fileExists(metaFilePath)
		let metaData = isMetaFileExists && addMetaData ? await readJsonFile(metaFilePath) : { name: imageName }

		if (isMetaFileExists && (metaData.maxDensity !== originDensity)) {
			info(`${UP_ONE_LINE}${UP_ONE_LINE}specified originDensity not equal to maxDensity in Metadata file "${metaFilePath}".\nProcessing of "${filePath}" file skipped.\n\n\n`)
			continue
		}

		metaData.maxDensity = originDensity

		if (isMetaFileExists && !isArraysEqualIgnoreCaseUnordered(metaData.formats, formats)) {
			info(`${UP_ONE_LINE}${UP_ONE_LINE}Metadata file "${metaFilePath}" has different formats than specified.\nProcessing of "${filePath}" file skipped.\n\n\n`)
			continue
		}

		metaData.formats = formats

		try {
			let { width, height } = await sharp(filePath).metadata()

			sizes.push({
				width: Math.ceil(width / originDensity),
				height: Math.ceil(height / originDensity),
			})

			for (let format of formats) {
				for (let density = originDensity; density > 0; density--) {
					let destFileName = `${baseName}${specifiedDensity === 0 ? `` : `@${density}x`}.${format}`
					let destPath = join(destSubfolder, destFileName)

					paths.push(`./${destFileName}`)

					await sharp(filePath)
						.resize(Math.ceil(width * density / originDensity))
						.toFormat(format)
						.toFile(resolve(destPath))

					progressBar.update()
				}
			}
		} catch (err) {
			if (err.message !== `Cannot use same file for input and output`) {
				error(`Error processing "${filePath}":\n`, err.message, `\n`)
			}
			error(`${UP_ONE_LINE}${UP_ONE_LINE}${` `.repeat(60)}\rError processing "${filePath}":\n`, err.message, `\n\n\n`)
			progressBar.update()
			continue
		}

		if (removeOrigin) {
			await rm(filePath)
		}

		if (!addMetaData) continue

		if (match[2]) sizes[0].breakpoint = parseInt(match[3], 10)

		let allSizes = [...(metaData.sizes || []), ...sizes]
		let uniqueSizes = allSizes.filter((size, index, array) => (
			index === array.findIndex(
				(s) => s.width === size.width
					&& s.height === size.height
					&& s.breakpoint === size.breakpoint,
			)
		))

		metaData.sizes = uniqueSizes.sort((a, b) => {
			if (!a.breakpoint) return 1
			if (!b.breakpoint) return -1

			return a.breakpoint - b.breakpoint
		})
		metaData.paths = Array.from(new Set([...metaData.paths || [], ...paths]))

		await writeFile(metaFilePath, `${JSON.stringify(metaData, null, `\t`)}\n`)

		let dests = `export default [\n${metaData.paths.reduce((acc, path) => `${acc}\tawait import(\`${path}\`).then((m) => m.default.src),\n`, ``)}]\n`

		await writeFile(importsFilePath, dests)
	}
}

/**
 * Checks if a file exists at the given file path.
 *
 * @param {string} filePath - The path of the file to check.
 * @return {Promise<boolean>} A promise that resolves to true if the file exists, false otherwise.
 */
async function fileExists (filePath) {
	try {
		await access(filePath)

		return true
	} catch {
		return false
	}
}

/**
 * Reads a JSON file from the specified path and parses its contents.
 *
 * @param {string} path - The path of the JSON file to read.
 * @return {Object} The parsed JSON object from the file.
 */
async function readJsonFile (path) {
	let file = await readFile(path)

	return JSON.parse(file)
}

/**
 * Checks if two arrays are equal ignoring case and order of elements.
 *
 * @param {Array<string>} first - The first array to compare.
 * @param {Array<string>} second - The second array to compare.
 * @return {boolean} True if the arrays contain the same elements (ignoring case and order), false otherwise.
 */
function isArraysEqualIgnoreCaseUnordered (first, second) {
	if (first.length !== second.length) return false

	let setB = new Set(second.map((s) => s.toLowerCase()))

	return first.every((val) => setB.has(val.toLowerCase()))
}
