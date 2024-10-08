import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { basename, dirname, extname, join, resolve } from "node:path"
import { error, info } from "node:console"

import sharp from "sharp"

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
	const {
		rasterPaths,
		inputDirectory,
		outputDirectory,
		targetFormats,
		addOriginFormat,
		originDensity: specifiedDensity,
		removeOrigin,
		addMetaData,
	} = options

	let originDensity = specifiedDensity === 0 ? 1 : specifiedDensity

	if (rasterPaths.length === 0) return

	info(`Conjuring raster images, please wait...\n`)

	for (const filePath of rasterPaths) {
		const fileName = basename(filePath, extname(filePath))
		const baseName = basename(fileName, extname(fileName))
		const subfolder = dirname(filePath.substring(inputDirectory.length))
		const destSubfolder = join(outputDirectory, subfolder)

		try {
			await mkdir(destSubfolder, { recursive: true })
		} catch (err) {
			if (err.code !== `EEXIST`) throw err
		}

		let paths = []
		let sizes = []
		let formats = targetFormats

		if (addOriginFormat) formats = [...new Set([...targetFormats, extname(filePath).slice(1)])]

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

					info(` 🪄  ${destPath}`)

					paths.push(`./${destFileName}`)

					await sharp(filePath)
						.resize(Math.ceil(width * density / originDensity))
						.toFormat(format)
						.toFile(resolve(destPath))
				}
			}
		} catch (err) {
			error(err)

			continue
		}

		if (removeOrigin) {
			await rm(filePath)
			info(` ⚠️  ${filePath} has been deleted`)
		}

		if (!addMetaData) continue

		let match = baseName.match(/^(.*?)(-(\d+))?$/)

		if (match[2]) sizes[0].breakpoint = parseInt(match[3], 10)

		let metaJsonPath = join(destSubfolder, `${match[1]}.json`)
		let metaJsPath = metaJsonPath.slice(0, -2)
		let isMetaFileExists = await fileExists(metaJsonPath)
		let metaData = isMetaFileExists ? await readJsonFile(metaJsonPath) : {}

		metaData.maxDensity = Math.max(metaData.maxDensity, originDensity)
		metaData.formats = Array.from(new Set([...metaData.formats || [], ...formats]))
		metaData.sizes = Array.from(new Set([...metaData.sizes || [], ...sizes].sort((a, b) => {
			if (!a.breakpoint) return 1
			if (!b.breakpoint) return -1

			return b.breakpoint - a.breakpoint
		})))
		metaData.paths = Array.from(new Set([...metaData.paths || [], ...paths]))

		await writeFile(metaJsonPath, `${JSON.stringify(metaData, null, `\t`)}\n`)

		info(` 🪄  ${metaJsonPath}`)

		metaData.dests = []

		let dests = `"dests": [\n\t${metaData.paths.reduce((acc, path) => `${acc}\tawait import(\`${path}\`).then((m) => m.default.src),\n\t`, ``)}]`

		await writeFile(metaJsPath, `export default ${JSON.stringify(metaData, null, `\t`)}\n`.replace(/"dests": \[\]/, dests))

		info(` 🪄  ${metaJsPath}`)
	}

	info(`\nComplete ✨\n`)
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
	const file = await readFile(path)

	return JSON.parse(file)
}
