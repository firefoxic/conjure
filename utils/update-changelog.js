import { readFile, writeFile } from 'node:fs/promises'

/**
 * Updates the CHANGELOG.md file with the latest version.
 *
 * @return {Promise<void>} - A promise that resolves when the CHANGELOG.md file is successfully updated.
 * @throws {Error} - If there is an error updating the CHANGELOG.md file.
 */
async function updateChangelog () {
	try {
		const changelogPath = `CHANGELOG.md`
		let changelogContent = await readFile(changelogPath, `utf-8`)

		changelogContent = await updateContent(changelogContent)

		await writeFile(changelogPath, changelogContent)
	} catch (error) {
		console.error(`Error updating CHANGELOG.md:`, error)
	}
}

/**
 * Updates the content of the CHANGELOG.md file with the latest version.
 *
 * @param {string} content - The content of the CHANGELOG.md file.
 * @return {Promise<string>} - The updated content of the CHANGELOG.md file.
 * @throws {Error} - If the CHANGELOG.md format is invalid.
 */
async function updateContent (content) {
	const separator = `[Unreleased]`
	const changelogParts = content.split(separator)

	if (changelogParts.length !== 3) throw new Error(`Invalid CHANGELOG.md: [Unreleased] link not found.`)

	const newVersion = await getNewVersion()
	const currentDate = formatDate((new Date))

	changelogParts[1] = `\n\n## [${newVersion}] — ${currentDate}${changelogParts[1]}`
	changelogParts[2] = updateChangelogLinks(changelogParts[2], newVersion)

	return changelogParts.join(separator)
}

/**
 * Asynchronously reads the version number from the package.json file and returns it.
 *
 * @return {Promise<string>} - A Promise that resolves with the version number from the package.json file.
 */
async function getNewVersion () {
	const packageJson = JSON.parse(await readFile(`package.json`, `utf-8`))

	return packageJson.version
}

/**
 * Formats a given date into a string in the format "YYYY-MM-DD".
 *
 * @param {Date} date - The date to be formatted.
 * @return {string} The formatted date string.
 */
function formatDate (date) {
	const yyyy = date.getFullYear()
	const mm = String(date.getMonth() + 1).padStart(2, `0`)
	const dd = String(date.getDate()).padStart(2, `0`)

	return `${yyyy}–${mm}–${dd}`
}

/**
 * Updates the CHANGELOG.md file by modifying the version link in the [Unreleased] section.
 *
 * @param {string} content - The content of the CHANGELOG.md file.
 * @param {string} newVersion - The new version number to be added.
 * @return {string} The modified CHANGELOG.md content.
 * @throws {Error} If the [Unreleased] link syntax is incorrect.
 */
function updateChangelogLinks (content, newVersion) {
	const linkRegex = /(: .+\/compare\/v)([0-9.]+)(...HEAD)/
	const linkMatch = content.match(linkRegex)

	if (!linkMatch) throw new Error(`Invalid CHANGELOG.md: [Unreleased] link syntax is incorrect.`)

	const previousVersion = linkMatch[2]
	const newLink = `${linkMatch[1]}${newVersion}${linkMatch[3]}\n[${newVersion}]${linkMatch[1]}${previousVersion}...v${newVersion}`

	return content.replace(linkRegex, newLink)
}

await updateChangelog()
