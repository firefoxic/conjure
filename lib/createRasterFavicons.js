import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, extname, dirname, join, resolve } from "node:path"

import sharp from "sharp"

export async function createRasterFavicons({ vectorPaths, inputDirectory, outputDirectory }) {
	let packageInfo = {}

	try {
		const packageJson = await readFile(resolve(process.cwd(), `package.json`), `utf8`)
		packageInfo = JSON.parse(packageJson)
	} catch (error) {
		console.error(`Error reading package.json:`, error)
	}

	for (const filePath of vectorPaths) {
		const fileName = basename(filePath, extname(filePath))
		const baseName = basename(fileName, extname(fileName))
		const subfolder = dirname(filePath.substring(inputDirectory.length))
		const destSubfolder = join(outputDirectory, subfolder)
		const rootRelativePath = destSubfolder.split(`/`).slice(1).join(`/`)
		const sizes = [180, 192, 512]
		const formats = [`png`, `webp`]
		let icons = []

		try {
			await access(destSubfolder)
		} catch {
			await mkdir(destSubfolder, { recursive: true })
		}

		for (const format of formats) {
			for (const size of sizes) {
				if (format === `webp` && size === 180) continue

				try {
					const image = sharp(filePath)
						.resize(size)
						.toFormat(format, { lossless: true })

					const outputPath = resolve(destSubfolder, `${baseName}-${size}.${format}`)
					await image.toFile(outputPath)
				} catch (error) {
					console.error(`Error processing ${filePath}:`, error)
				}

				if (size === 180) continue

				icons.push(
					{
						src: `/${rootRelativePath}${baseName}-${size}.${format}`,
						sizes: `${size}x${size}`,
						type: `image/${format}`,
					},
				)
			}
		}

		const webmanifest = {
			...(packageInfo.name && { name: packageInfo.name }),
			...(packageInfo.description && { description: packageInfo.description }),
			icons,
		}

		const webmanifestPath = resolve(destSubfolder, `${baseName}.webmanifest`)
		try {
			await writeFile(webmanifestPath, JSON.stringify(webmanifest, null, `\t`))
		} catch (error) {
			console.error(`Error writing ${baseName}.webmanifest file:`, error)
		}
	}
}
