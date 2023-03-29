var args = process.argv.slice(1)
var fs = require('fs')

var options = {
	alphabet: 'abcdefghijklmnopqrstuvwxyz -_.&?!@ #/',
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
				options.alphabet = match[2]
			}
			break
		case 'key':
			if (checkArgFunc(arg, match[2])) {
				options.key = parseInt(match[2])
				if (isNaN(options.key)) throw new Error('Key is not a number')
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

var processFile = function (data, shift) {
	let processedData = ''

	if (shift > options.alphabet.length) shift = shift % options.alphabet.length

	if (data.length === 0) throw new Error('data length = 0')

	data = data.toLowerCase()

	for (let i = 0; i < data.length; i++) {
		if (options.alphabet.indexOf(data[i]) !== -1) {
			const alphabetIndex = options.alphabet.indexOf(data[i])

			if (options.mode === 'ENCRYPT') {
				if (options.alphabet[alphabetIndex + shift])
					processedData += options.alphabet[alphabetIndex + shift]
				else
					processedData +=
						options.alphabet[alphabetIndex + shift - options.alphabet.length]
			} else {
				if (options.alphabet[alphabetIndex - shift])
					processedData += options.alphabet[alphabetIndex - shift]
				else
					processedData +=
						options.alphabet[alphabetIndex - shift + options.alphabet.length]
			}
		} else processedData += data[i]
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
