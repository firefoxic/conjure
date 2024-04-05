import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve, extname, basename } from "node:path"

import { optimize, loadConfig } from "svgo"

const svgoConfig = await loadConfig() ?? await import(`./svgoConfig.js`).then((m) => m.default || m.svgoConfig)

export async function optimizeVector ({ vectorPaths, inputDirectory, outputDirectory }) {
	for (const filePath of vectorPaths) {
		try {
			const data = await readFile(filePath, `utf8`)
			const result = optimize(data, { ...svgoConfig, path: filePath })

			if (result.error) {
				throw new Error(`Error optimizing: ${filePath}: ${result.error}`)
			}

			const subfolder = dirname(filePath.substring(inputDirectory.length))
			const destSubfolder = join(outputDirectory, subfolder)
			await mkdir(destSubfolder, { recursive: true })

			const fileName = basename(filePath, extname(filePath))
			const destPath = resolve(destSubfolder, `${fileName}.svg`)

			await writeFile(destPath, result.data)
		} catch (error) {
			console.error(`Error processing ${filePath}:`, error)
		}
	}
}
