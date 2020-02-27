// JS file converted from Python
// generates a italian fiscal code
// original file here https://github.com/ema/pycodicefiscale

const global_vowels = ['A', 'E', 'I', 'O', 'U']
const global_consonants = [
    'B',
    'C',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'V',
    'W',
    'X',
    'Y',
    'Z',
]

const string_asci = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const monthscode = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T']
const pattern =
    '^[A-Z]{6}[0-9]{2}([A-E]|[HLMPRST])[0-9]{2}[A-Z][0-9]([A-Z]|[0-9])[0-9][A-Z]$'

/**
 *
 * @param {String} code
 */
const isvalid = code => {
    /* This function checks if the given fiscal code is syntactically valid.
    eg: isvalid('RCCMNL83S18D969H') -> True
    isvalid('RCCMNL83S18D969') -> False
    */
    return typeof code === 'string' && !!code.match(pattern)
}
// Fiscal code calculation
const _common_triplet = (input_string, consonants, vowels) => {
    let output = consonants

    while (output.length < 3) {
        try {
            output += vowels[0]
        } catch (e) {
            // If there are less wovels than needed to fill the triplet,
            // (e.g. for a surname as "Fo'" or "Hu" or the corean "Y")
            // fill it with 'X';
            output += 'X'
        }
    }

    return output.slice(0, 3)
}

/**
 *
 * @param {String} input_string
 */
const _consonants_and_vowels = input_string => {
    // Get the consonants as a string and the vowels as a list.
    const i = input_string.toUpperCase().replace(' ', '')
    const c = []
    i.split('').forEach(char => {
        if (global_consonants.includes(char)) c.push(char)
    })
    const v = []
    i.split('').forEach(char => {
        if (global_vowels.includes(char)) v.push(char)
    })

    return { consonants: c.join().replace(/,/g, ''), vowels: v }
}

/**
 *
 * @param {String} input_string
 */
const _surname_triplet = input_string => {
    const { consonants, vowels } = _consonants_and_vowels(input_string)
    console.log(vowels)
    return _common_triplet(input_string, consonants, vowels)
}

/**
 *
 * @param {String} input_string
 */
const _name_triplet = input_string => {
    // highly unlikely: no first name, like for instance some Indian persons
    // with only one name on the passport
    // pylint: disable=W0511
    if (input_string == '') return 'XXX'

    const { consonants, vowels } = _consonants_and_vowels(input_string)

    if (consonants.length > 3) return `${consonants[0]}${consonants[2]}${consonants[3]}`

    return _common_triplet(input_string, consonants, vowels)
}

/**
 *
 * @param {Integer} input_string
 */
const _control_code = input_string => {
    // Computes the control code for the given input_string string. The expected
    // input_string is the first 15 characters of a fiscal code.
    // eg: control_code('RCCMNL83S18D969') -> 'H'
    const even_controlcode = {
        '0': 0,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        A: 0,
        B: 1,
        C: 2,
        D: 3,
        E: 4,
        F: 5,
        G: 6,
        H: 7,
        I: 8,
        J: 9,
        K: 10,
        L: 11,
        M: 12,
        N: 13,
        O: 14,
        P: 15,
        Q: 16,
        R: 17,
        S: 18,
        T: 19,
        U: 20,
        V: 21,
        W: 22,
        X: 23,
        Y: 24,
        Z: 25,
    }

    const values = [
        1,
        0,
        5,
        7,
        9,
        13,
        15,
        17,
        19,
        21,
        2,
        4,
        18,
        20,
        11,
        3,
        6,
        8,
        12,
        14,
        16,
        10,
        22,
        25,
        24,
        23,
    ]

    const odd_controlcode = {
        '0': 1,
        '1': 0,
        '2': 5,
        '3': 7,
        '4': 9,
        '5': 13,
        '6': 15,
        '7': 17,
        '8': 19,
        '9': 21,
        A: 1,
        B: 0,
        C: 5,
        D: 7,
        E: 9,
        F: 13,
        G: 15,
        H: 17,
        I: 19,
        J: 21,
        K: 2,
        L: 4,
        M: 18,
        N: 20,
        O: 11,
        P: 3,
        Q: 6,
        R: 8,
        S: 12,
        T: 14,
        U: 16,
        V: 10,
        W: 22,
        X: 25,
        Y: 24,
        Z: 23,
    }

    let code = 0
    for (const [index, element] of input_string.split('').entries()) {
        if (index % 2 === 0) code += odd_controlcode[element]
        else code += even_controlcode[element]
    }

    return string_asci[code % 26]
}

/**
 *
 * @param {String} surname
 * @param {String} name
 * @param {Datetime} birthday
 * @param {String} sex
 * @param {String} municipality
 */
const build = (surname, name, year, month, day, sex, municipality) => {
    // Computes the fiscal code for the given person data.
    // eg: build('Rocca', 'Emanuele', 1983, 11, 18, 'M', 'D969')
    // -> RCCMNL83S18D969H

    let output = _surname_triplet(surname) + _name_triplet(name)
    output += year.toString().substr(2, 2)
    output += monthscode[month - 1]
    output += sex === 'M' ? day : 40 + day
    output += municipality
    output += _control_code(output)

    return output
}
