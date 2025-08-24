import { stdout } from "node:process"
import { styleText } from "node:util"

import { UP_ONE_LINE } from "./constants.js"

/**
 * Creates a command-line progress bar.
 *
 * @param {number} total - Total number of steps.
 * @param {number} [step=1] - Number of steps to increment on each update.
 *
 * @returns {{ update: function }} An object with methods that initialize and updates the progress bar.
 */
export function createProgressBar (total, step = 1) {
	let current = 0
	let messageStart = `Optimizing of images`
	let messageEnd = `out of ${total} files done…`

	let totalSctringLength = String(total).length

	function getMessage (currentNumber) {
		return ` ${messageStart}: ${String(currentNumber).padStart(totalSctringLength, ` `)} ${messageEnd} `
	}

	let message = getMessage(current)
	let barLength = message.length

	stdout.write(`\n\n${UP_ONE_LINE}\r${styleText([`greenBright`, `bgBlack`], message)}\n`)

	return {
		update () {
			current += step

			if (current > total) current = total

			message = getMessage(current)

			if (current === total) message = `${message.replace(`…`, `.`)}\n`

			let percentage = (current / total) * 100
			let filledLength = Math.round(barLength * percentage / 100)
			let filledPart = styleText(`inverse`, message.substring(0, filledLength))
			let nonFilledPart = message.substring(filledLength)

			let bar = styleText([`greenBright`, `bgBlack`], filledPart + nonFilledPart)

			stdout.write(`${UP_ONE_LINE}\r${bar}\n`)
		},
	}
}
//  Optimizing of images:  0 out of 24 files done…
