import { writeFile, mkdir } from "node:fs/promises"
import { basename, dirname, extname, join, resolve } from "node:path"

import sharp from "sharp"
import icoEndec from "ico-endec"

export async function convertSvgToIco({ vectorPaths, inputDirectory, outputDirectory }) {
	vectorPaths.forEach(async (filePath) => {
		try {
			const pngBuffer = await sharp(filePath)
				.resize(32, 32)
				.png()
				.toBuffer()

			const destData = icoEndec.encode(pngBuffer)

			const subfolder = dirname (filePath.substring(inputDirectory.length))
			const destSubfolder = join(outputDirectory, subfolder)
			await mkdir(destSubfolder, { recursive: true })

			const fileName = basename(filePath, extname(filePath))
			const destPath = resolve(destSubfolder, `${fileName}.ico`)

			await writeFile(destPath, destData)
		} catch (error) {
			console.error(`Error processing ${filePath}:`, error)
		}
	})
}
