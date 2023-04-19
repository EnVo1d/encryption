var args = process.argv.slice(1) // отримання параметрів запуску
var fs = require('fs') // підключення бібл для взаємодії с файловою системою

var options = {
	alphabet: 'abcdefghijklmnopqrstuvwxyz',
	keys: [],
	mode: undefined,
} // об'єкт для збереження параметрів запуску

var continueProcessing = true

var checkArgFunc = function (arg, option) {
	// функція перевірки чи вказані параметри для опції
	if (!option) {
		console.log(arg + ' option requires a parameter')
		continueProcessing = false
		return false
	}
	return true
}

args = args.filter(function (arg) {
	// зчитування параметрів та збереження
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
		case 'keys':
			if (checkArgFunc(arg, match[2])) {
				let tmp = match[2].split(';')
				options.keys.push(parseInt(tmp.at(0)))
				if (isNaN(options.keys.at(0))) {
					console.error('Key is not a number')
					process.exit()
				}
				options.keys.push(parseInt(tmp.at(1)))
				if (isNaN(options.keys.at(1))) {
					console.error('Key is not a number')
					process.exit()
				}
			}
			break
		case 'mode':
			if (checkArgFunc(arg, match[2])) {
				options.mode = match[2]
			}
			break
		default:
			continueProcessing = false
			break
	}
})
if (!continueProcessing) {
	process.exit()
}
var input = args[1] // отримання шляху до файлу на обробку
if (input === undefined) {
	// якщо шлях не передано вийти із програми
	console.error('Enter file path')
	process.exit()
}
console.log(options.keys)
if (options.keys.length <= 1 || options.mode === undefined) {
	// якщо параметри ключ та режим не встановлені - вийти з програми
	console.error('Mode and key required parameters')
	process.exit()
}

var writeResult = function (data) {
	fs.writeFile(
		// запис у файл результату
		options.mode === 'ENCRYPT'
			? `${input}_encrypted`
			: options.mode === 'DECRYPT'
			? `${input}_decrypted`
			: '',
		data,
		{ flag: 'w+' },
		err => {
			console.error(err)
			process.exit()
		}
	)
}

var processFile = function (data, keys) {
	let processedData = '' // змінна для зберігання результату

	if (data.length === 0) {
		console.error('File is empty!')
		process.exit()
	} // якщо файл пустий - помилка

	data = data.toLowerCase() // переведення даниих в нижній регістр

	if (options.mode === 'ENCRYPT')
		for (let i = 0; i < data.length; i++) {
			// processedData = (ax + b) mod alphabet.length
			if (options.alphabet.includes(data[i])) {
				let encryptChar =
					(keys[0] * options.alphabet.indexOf(data[i]) + keys[1]) %
					options.alphabet.length

				processedData += options.alphabet[encryptChar]
			} else processedData += data[i]
		}
	else {
		//a^-1 = m - a
		for (let i = 0; ; i++) {
			if ((i * keys[0]) % options.alphabet.length === 1) {
				key = i
				break
			}
		}
		for (let i = 0; i < data.length; i++) {
			// processedData = a^-1 * (y - b) mod alphabet.length
			if (options.alphabet.includes(data[i])) {
				let encryptChar =
					(key *
						(options.alphabet.indexOf(data[i]) +
							options.alphabet.length -
							keys[1])) %
					options.alphabet.length

				processedData += options.alphabet[encryptChar]
			} else processedData += data[i]
		}
	}
	writeResult(processedData)
}

fs.readFile(input, 'utf-8', (err, data) => {
	// читання файлу
	if (err) {
		console.error(err)
		process.exit()
	}
	processFile(data, options.keys) // запуск обробки файлу
})
