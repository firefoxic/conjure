import { error } from "node:console"
import { basename, dirname, extname, join, resolve } from "node:path"
import { mkdir, readFile, writeFile } from "node:fs/promises"

import { loadConfig, optimize } from "svgo"

const svgoConfig = await loadConfig() ?? await import(`./svgoConfig.js`).then((m) => m.default || m.svgoConfig)

/**
 * Optimizes a set of vector files.
 *
 * @param {Object} options - The options for optimization.
 * @param {Array} options.vectorPaths - The array of file paths to optimize.
 * @param {string} options.inputDirectory - The input directory path.
 * @param {string} options.outputDirectory - The output directory path.
 * @throws {Error} If there is an error during optimization.
 */
export async function optimizeVector ({ vectorPaths, inputDirectory, outputDirectory }) {
	for (const filePath of vectorPaths) {
		await optimizeFile(filePath)
	}

	/**
	 * Optimizes a single vector file.
	 *
	 * @param {string} filePath - The file path to optimize.
	 */
	async function optimizeFile (filePath) {
		try {
			const data = await readFile(filePath, `utf8`)
			const result = optimize(data, { ...svgoConfig, path: filePath })

			if (result.error) throw new Error(`Error optimizing: ${filePath}: ${result.error}`)

			const subfolder = dirname(filePath.substring(inputDirectory.length))
			const destSubfolder = join(outputDirectory, subfolder)

			await mkdir(destSubfolder, { recursive: true })

			const fileName = basename(filePath, extname(filePath))
			const destPath = resolve(destSubfolder, `${fileName}.svg`)

			await writeFile(destPath, result.data)
		} catch (err) {
			error(`Error processing ${filePath}:`, err)
		}
	}
}
