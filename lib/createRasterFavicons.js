import { access, mkdir } from "node:fs/promises"
import { basename, extname, dirname, join, resolve } from "node:path"

import sharp from "sharp"

export async function createRasterFavicons({ vectorPaths, inputDirectory, outputDirectory }) {
	for (const filePath of vectorPaths) {
		const fileName = basename(filePath, extname(filePath))
		const baseName = basename(fileName, extname(fileName))
		const subfolder = dirname(filePath.substring(inputDirectory.length))
		const destSubfolder = join(outputDirectory, subfolder)

		try {
			await access(destSubfolder)
		} catch {
			await mkdir(destSubfolder, { recursive: true })
		}

		for (const format of [`png`, `webp`]) {
			for (const size of [512, 192, 180]) {
				if (!(format === `webp` && size === 180)) {
					try {
						const image = sharp(filePath)
							.resize(size)
							.toFormat(format, { lossless: true })

						const outputPath = resolve(destSubfolder, `${baseName}-${size}.${format}`)
						await image.toFile(outputPath)
					} catch (error) {
						console.error(`Error processing ${filePath}:`, error)
					}
				}
			}
		}
	}
}
