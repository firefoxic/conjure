import { stdout } from "node:process"

const ONE_LINE_UP = `\x1b[A`

/**
 * Creates a command-line progress bar.
 *
 * @param {number} total - Total number of steps.
 * @param {{step: number, barLength: number, message: string}} [options] - Progress bar options.
 * @param {number} [options.step=1] - Increment value.
 * @param {number} [options.barLength=50] - Length of the bar in characters.
 * @param {string} [options.messageStart='Processing, please wait...'] - Message to display before the progress bar.
 * @param {string} [options.messageEnd='Complete!'] - Message to display when the progress bar is complete.
 *
 * @returns {{ update: function }} An object with methods that initialize and updates the progress bar.
 */
export function createProgressBar (total, {
	step = 1,
	barLength = 50,
	messageStart = `Processing, please wait...`,
	messageEnd = `Complete!`,
} = {}) {
	let current = 0

	stdout.write(`\n ${messageStart}\n\n\n${ONE_LINE_UP}\r▕${`░`.repeat(barLength)}▏ 0.00%\n\n`)

	return {
		update () {
			current += step

			if (current > total) current = total

			let percentage = (current / total) * 100
			let filledLength = Math.round(barLength * percentage / 100)
			let bar = `█`.repeat(filledLength) + `░`.repeat(barLength - filledLength)

			stdout.write(`${ONE_LINE_UP}${ONE_LINE_UP}\r▕${bar}▏ ${percentage.toFixed(2)}%\n\n`)

			if (current >= total) {
				stdout.write(` ${messageEnd}\n`)
			}
		},
	}
}
