var args = process.argv.slice(1)
var fs = require('fs')

var options = {
	alphabet: 'abcdefghijklmnopqrstuvwxyz'.split(''),
	key: 0,
	mode: '',
}

var continueProcessing = true,
	currentErrorcode

process.on('exit', function () {
	process.reallyExit(currentErrorcode)
})

var checkArgFunc = function (arg, option) {
	if (!option) {
		console.log(arg + ' option requires a parameter')
		continueProcessing = false
		return false
	}
	return true
}

args = args.filter(function (arg) {
	var match

	if ((match = arg.match(/^-I(.+)$/))) {
		options.filePath.push(match[1])
		return false
	}

	if ((match = arg.match(/^--?([a-z][0-9a-z-]*)(?:=(.*))?$/i))) {
		arg = match[1]
	} else {
		return arg
	}

	switch (arg) {
		case 'alph':
			if (checkArgFunc(arg, match[2])) {
				options.alphabet = (match[2] + '_').split('')
			}
			break
		case 'key':
			if (checkArgFunc(arg, match[2])) {
				options.key = match[2]
				if (Number.isInteger(options.key))
					throw new Error('The key is a number')
			}
			break
		case 'mode':
			if (checkArgFunc(arg, match[2])) {
				options.mode = match[2]
			}
			break
		default:
			continueProcessing = false
			currentErrorcode = 1
			break
	}
})
if (!continueProcessing) {
	return
}
var input = args[1]

var shiftArray = function (array, num) {
	const copy = [...array]

	for (let i = 0; i < num; i++) {
		copy.push(copy.shift())
	}

	return copy
}

var buildSchema = function () {
	const column = {}
	for (const char of options.alphabet) {
		const row = {}

		for (const shift of options.alphabet) row[shift] = ''

		column[char] = row
	}
	return column
}

var buildTable = function () {
	const table = buildSchema()

	for (const [i, row] of options.alphabet.entries()) {
		const shifted = shiftArray(options.alphabet, i)
		for (const [j, column] of options.alphabet.entries()) {
			table[row][column] = shifted[j]
		}
	}
	return table
}

var padKeyword = function (key, limit) {
	let padded = key.toLowerCase()

	while (padded.length < limit) {
		padded += padded
	}

	if (padded.length > limit) {
		padded = padded.substring(0, limit)
	}

	return padded
}

var getOriginPos = function (row, char) {
	return Object.keys(row).find(key => row[key] === char)
}

var processFile = function (data, key) {
	let processedData = ''

	if (data.length === 0) throw new Error('data length = 0')

	data = data.toLowerCase()

	const table = buildTable()

	const padded = padKeyword(key, data.length)

	if (options.mode === 'ENCRYPT') {
		for (const [i, char] of data.split('').entries()) {
			processedData += table[padded[i]][char]
		}
	} else {
		data = data.split('')
		for (const [i, char] of data.entries()) {
			processedData += getOriginPos(table[padded[i]], char)
		}
	}

	fs.writeFile(
		(options.mode === 'ENCRYPT'
			? 'encrypted_'
			: options.mode === 'DECRYPT'
			? 'decrypted_'
			: '') + input,
		processedData,
		{ flag: 'w+' },
		err => {
			console.error(err)
		}
	)
}

fs.readFile(input, 'utf-8', (err, data) => {
	if (err) {
		console.error(err)
		return
	}
	processFile(data, options.key)
})
