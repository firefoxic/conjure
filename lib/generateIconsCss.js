import { writeFile } from "node:fs/promises"
import { basename, dirname, join, posix } from "node:path"

/**
 * Generates CSS for icons.
 *
 * @param {Object} options - The options for generating CSS.
 * @param {boolean} options.addMetaData - Indicates whether to add metadata.
 * @param {string} options.outputDirectory - The directory where the CSS file will be saved.
 * @param {Array<string>} options.vectorPaths - The paths to the vector icons.
 * @throws {Error} If the CSS generation fails.
 */
export async function generateIconsCss ({ addMetaData, outputDirectory, vectorPaths }) {
	if (!addMetaData || !vectorPaths) return

	let cssFile = join(outputDirectory, `index.css`)

	let css = vectorPaths.map((path) => {
		let localPath = path.replace(outputDirectory, `.`)
		let posixPath = posix.normalize(localPath)
		let iconName = basename(posixPath, `.svg`)

		// If the icon is in a nested subdirectory, prefix the icon name with the subdirectory name.
		if (dirname(posixPath) !== `.`) {
			iconName = `${dirname(posixPath).split(`/`).join(`-`)}-${iconName}`
		}

		return `
@property --Icon_shape_${iconName} {
	syntax: "<url>";
	inherits: false;
	initial-value: url("./${posixPath}");
}
`.trimStart()
	}).join(`\n`)

	try {
		await writeFile(cssFile, css)
	} catch (error) {
		throw new Error(`Failed to generate icons CSS:\n${error.message}`)
	}
}
