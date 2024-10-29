import { error } from "node:console"
import { basename, dirname, extname, join, resolve } from "node:path"
import { mkdir, readFile, writeFile } from "node:fs/promises"

import { loadConfig, optimize } from "svgo"

let svgoConfig = await loadConfig() ?? await import(`./svgoConfig.js`).then((m) => m.default || m.svgoConfig)

/**
 * Optimizes a set of vector files.
 *
 * @param {Object} options - The options for optimization.
 * @param {Array} options.vectorPaths - The array of file paths to optimize.
 * @param {string} options.inputDirectory - The input directory path.
 * @param {string} options.outputDirectory - The output directory path.
 * @param {string} options.publicDirectory - The public directory path.
 * @throws {Error} If there is an error during optimization.
 */
export async function optimizeVector ({ vectorPaths, inputDirectory, outputDirectory, publicDirectory }) {
	for (let filePath of vectorPaths) {
		await optimizeFile(filePath)
	}

	/**
	 * Optimizes a single vector file.
	 *
	 * @param {string} filePath - The file path to optimize.
	 */
	async function optimizeFile (filePath) {
		try {
			let data = await readFile(filePath, `utf8`)
			let result = optimize(data, { ...svgoConfig, path: filePath })

			if (result.error) throw new Error(`Error optimizing: ${filePath}: ${result.error}`)

			if (filePath.startsWith(publicDirectory)) {
				await writeFile(filePath, result.data)

				return
			}

			let subfolder = dirname(resolve(filePath).substring(resolve(inputDirectory).length))
			let destSubfolder = join(outputDirectory, subfolder)

			await mkdir(destSubfolder, { recursive: true })

			let fileName = basename(filePath, extname(filePath))
			let destPath = resolve(destSubfolder, `${fileName}.svg`)

			await writeFile(destPath, result.data)
		} catch (err) {
			error(`Error processing ${filePath}:`, err)
		}
	}
}
