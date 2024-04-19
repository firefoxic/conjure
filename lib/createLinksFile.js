import { writeFile } from "node:fs/promises"

/**
 * Creates a markdown file with links to favicons and app icons.
 *
 * @param {Object} options - The options object.
 * @param {string} options.outputDirectory - The directory where the links file will be created.
 * @returns {Promise<void>} - A promise that resolves when the links file is created.
 */
export async function createLinksFile ({ outputDirectory }) {
	const rootRelativePath = outputDirectory.split(`/`).slice(1).join(`/`)

	const content = `# Favicon links

1. Paste the following links to the \`<head>\` of your HTML document layout:

	\`\`\`html
	<link rel="icon" href="/favicon.ico" sizes="32x32">
	<link rel="icon" href="/${rootRelativePath}/icon.svg" type="image/svg+xml">
	<link rel="apple-touch-icon" href="/${rootRelativePath}/180.png">
	<link rel="manifest" href="/manifest.webmanifest">
	\`\`\`

2. Move the resulting \`favicon.ico\` and \`manifest.webmanifest\` to the project directory, from where they will be moved to the root of the server.

3. Double-check and edit (if it's necessary) the paths in the link tags and in the \`manifest.webmanifest\` to make sure they match the file structure of your project.
`

	await writeFile(`${outputDirectory}/Links.md`, content)
}
