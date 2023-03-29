var args = process.argv.slice(1) // отримання параметрів запуску
var fs = require('fs') // підключення бібл для взаємодії с файловою системою

var options = {
	alphabet: 'abcdefghijklmnopqrstuvwxyz -_.&?!@ #/',
	key: undefined,
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
		case 'key':
			if (checkArgFunc(arg, match[2])) {
				options.key = parseInt(match[2])
				if (isNaN(options.key)) {
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

if (options.key === undefined && options.mode === undefined) {
	// якщо параметри ключ та режим не встановлені - вийти з програми
	console.error('Mode and key required parameters')
	process.exit()
}

var processFile = function (data, shift) {
	// обробка файлу, приймає дані файлу та ключ
	let processedData = '' // змінна для зберігання результату

	if (shift > options.alphabet.length) shift = shift % options.alphabet.length // зменшення ключа у разі якщо він більший довжини алфавіту

	if (data.length === 0) {
		console.error('File is empty!')
		process.exit()
	} // якщо файл пустий - помилка

	data = data.toLowerCase() // переведення даниих в нижній регістр

	for (let i = 0; i < data.length; i++) {
		// цикл шифрування
		if (options.alphabet.indexOf(data[i]) !== -1) {
			// перевірка на входження символа в алфавіт
			const alphabetIndex = options.alphabet.indexOf(data[i]) // отримання індексу символа в алфавіті

			if (options.mode === 'ENCRYPT') {
				// визначення типу операції
				if (options.alphabet[alphabetIndex + shift])
					// перевірка чи є символ в алфавіті з зсунутим індексом
					processedData += options.alphabet[alphabetIndex + shift]
				// додавання зсунутого символу
				else
					processedData +=
						options.alphabet[alphabetIndex + shift - options.alphabet.length] // якщо виходе за границі алфавіту, відраховується з початку
			} else {
				// дешифрування - аналогічно шифруванню, тільки з зсувом в зворотну сторону алфавіту
				if (options.alphabet[alphabetIndex - shift])
					processedData += options.alphabet[alphabetIndex - shift]
				else
					processedData +=
						options.alphabet[alphabetIndex - shift + options.alphabet.length]
			}
		} else processedData += data[i] // додавання символів які не знайдено в алфавіті
	}
	fs.writeFile(
		// запис у файл результату
		(options.mode === 'ENCRYPT'
			? 'encrypted_'
			: options.mode === 'DECRYPT'
			? 'decrypted_'
			: '') + input,
		processedData,
		{ flag: 'w+' },
		err => {
			console.error(err)
			process.exit()
		}
	)
}

fs.readFile(input, 'utf-8', (err, data) => {
	// читання файлу
	if (err) {
		console.error(err)
		process.exit()
	}
	processFile(data, options.key) // запуск обробки файлу
})
