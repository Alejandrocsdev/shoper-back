function sha256(input) {
  // 將輸入的字串轉換為二進制
  const binaryString = toBinary(input)
  // 將二進制字串填充至長度為512位元
  const paddedString = to512Length(binaryString)
  // 將512位元字串分成32位元的部分
  const partsArray = to32BitParts(paddedString)
  // 將32位元的部分轉換為字(32位元整數)的陣列
  const wordsArray = toWords(partsArray)
  // 計算 SHA-256 雜湊
  return main(wordsArray)
}

// 將字串轉換為二進制字串
function toBinary(input) {
  let result = ''
  for (let i = 0; i < input.length; i++) {
    result += input[i].charCodeAt(0).toString(2).padStart(8, '0')
  }
  return result
}

// 填充至512位元的長度
function to512Length(input) {
  let result = ''
  const length = input.length
  result += input
  result += '1'
  result += modOperation512(length)
  result += length.toString(2).padStart(64, '0')
  return result
}

// 將512位元字串分成32位元的部分
function to32BitParts(input) {
  const rounds = input.length / 512
  let parts = []
  for (let i = 0; i < rounds; i++) {
    parts = parts.concat(input.slice(0 + 512 * i, 512 + 512 * i))
  }
  return parts
}

// 將32位元的部分轉換為字(32位元整數)的陣列
function toWords(input) {
  let wsArray = []
  for (let i = 0; i < input.length; i++) {
    let wArray = []
    for (let j = 0; j < 16; j++) {
      wArray = wArray.concat(input[i].slice(0 + 32 * j, 32 + 32 * j))
    }
    wsArray.push(wArray)
  }
  return wsArray
}

// 處理第17~64W (Words)
function tiesFunc(tie, index) {
  return modOperation232(
    modOperation232(
      modOperation232(sigma1(tie[index - 2]), tie[index - 7]),
      sigma0(tie[index - 15])
    ),
    tie[index - 16]
  )
}

// 將二進制轉換為十六進制
function binaryToHex(binary) {
  return parseInt(binary, 2).toString(16).padStart(8, '0')
}

function main(result) {
  let h0, h1, h2, h3, h4, h5, h6, h7
  let a, b, c, d, e, f, g, h
  let T1, T2
  for (let i = 0; i < result.length; i++) {
    let phraseW64Array = []
    if (i === 0) {
      h0 = hash(0)
      h1 = hash(1)
      h2 = hash(2)
      h3 = hash(3)
      h4 = hash(4)
      h5 = hash(5)
      h6 = hash(6)
      h7 = hash(7)
    }
    a = h0
    b = h1
    c = h2
    d = h3
    e = h4
    f = h5
    g = h6
    h = h7
    for (let j = 0; j < 64; j++) {
      if (j < 16) {
        phraseW64Array = phraseW64Array.concat(result[i][j])
      } else {
        phraseW64Array = phraseW64Array.concat(tiesFunc(phraseW64Array, j))
      }
    }
    for (let k = 0; k < 64; k++) {
      T1 = modOperation232(
        modOperation232(modOperation232(modOperation232(h, summary1(e)), choose(e, f, g)), kay(k)),
        phraseW64Array[k]
      )
      T2 = modOperation232(summary0(a), majority(a, b, c))
      h = g
      g = f
      f = e
      e = modOperation232(d, T1)
      d = c
      c = b
      b = a
      a = modOperation232(T1, T2)
    }
    h0 = modOperation232(a, h0)
    h1 = modOperation232(b, h1)
    h2 = modOperation232(c, h2)
    h3 = modOperation232(d, h3)
    h4 = modOperation232(e, h4)
    h5 = modOperation232(f, h5)
    h6 = modOperation232(g, h6)
    h7 = modOperation232(h, h7)
  }

  let finalResult = ''
  finalResult =
    binaryToHex(h0) +
    binaryToHex(h1) +
    binaryToHex(h2) +
    binaryToHex(h3) +
    binaryToHex(h4) +
    binaryToHex(h5) +
    binaryToHex(h6) +
    binaryToHex(h7)
  return finalResult
}

// NOT 運算
function notOperation(str) {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    result += str[i] === '1' ? '0' : '1'
  }
  return result
}

// AND 運算
function andOperation(str01, str02) {
  let result = ''
  for (let i = 0; i < str01.length; i++) {
    result += Number(str01[i]) * Number(str02[i]) === 0 ? '0' : '1'
  }
  return result
}

// XOR 運算
function xorOperation(str01, str02) {
  let result = ''
  for (let i = 0; i < str01.length; i++) {
    result += str01[i] === str02[i] ? '0' : '1'
  }
  return result
}

// 232 位元餘數運算
function modOperation232(str01, str02) {
  const num = Math.pow(2, 32)
  const decimal01 = parseInt(str01, 2)
  const decimal02 = parseInt(str02, 2)
  const sum = decimal01 + decimal02
  const mod = sum >= 0 ? sum % num : (sum % num) + num
  const result = mod.toString(2).padStart(32, '0')
  return result
}

// 填充至512位元的長度
function modOperation512(length) {
  num = 448 - length - 1
  const zeros = num >= 0 ? num % 512 : (num % 512) + 512
  const result = '0'.repeat(zeros)
  return result
}

// 循環右移
function rotateRight(str, num) {
  let result = ''
  result += str.slice(str.length - num)
  result += str.slice(0, str.length - num)
  return result
}

// 右移
function shiftRight(str, num) {
  let result = ''
  result += '0'.repeat(num)
  result += str.slice(0, str.length - num)
  return result
}

// 計算σ0函數
function sigma0(str) {
  return xorOperation(xorOperation(rotateRight(str, 7), rotateRight(str, 18)), shiftRight(str, 3))
}

// 計算σ1函數
function sigma1(str) {
  return xorOperation(xorOperation(rotateRight(str, 17), rotateRight(str, 19)), shiftRight(str, 10))
}

// 計算Choose函數
function choose(str01, str02, str03) {
  return xorOperation(andOperation(str01, str02), andOperation(notOperation(str01), str03))
}

// 計算Majority函數
function majority(str01, str02, str03) {
  return xorOperation(
    xorOperation(andOperation(str01, str02), andOperation(str01, str03)),
    andOperation(str02, str03)
  )
}

// 計算Summary0函數
function summary0(str) {
  return xorOperation(xorOperation(rotateRight(str, 2), rotateRight(str, 13)), rotateRight(str, 22))
}

// 計算Summary1函數
function summary1(str) {
  return xorOperation(xorOperation(rotateRight(str, 6), rotateRight(str, 11)), rotateRight(str, 25))
}

// 驗證值數
function isPrimeNum(num) {
  let i = 1
  let factorsCount = 0
  while (i <= num) {
    if (num % i === 0) {
      factorsCount++
    }
    i++
  }
  if (factorsCount === 2) {
    return true
  } else {
    return false
  }
}

// 由序數獲取質數
function getOrdinalPrimeNum(ordinal) {
  let i = 0
  let correctOrdinal = 0
  while (correctOrdinal !== ordinal) {
    if (isPrimeNum(i) === true) {
      correctOrdinal++
    }
    if (correctOrdinal === ordinal) {
      break
    }
    i++
  }
  return i
}

// 初始值H
// 設定初始值，初始值是前8個質數開根號後的小數點後前32位元
function hash(num) {
  const prime = getOrdinalPrimeNum(num + 1)
  const squareRoot = Math.pow(prime, 1 / 2)
  const fractionalPart = squareRoot - Math.trunc(squareRoot)
  const bits32 = Math.trunc(fractionalPart * Math.pow(2, 32))
  //小數點後前32位元
  const binary = bits32.toString(2).padStart(32, '0')
  return binary
}

// 初始值K
// 設定初始值，初始值是前64個質數開三次方根後的小數點後前32位元
function kay(num) {
  const prime = getOrdinalPrimeNum(num + 1)
  const cubeRoot = Math.pow(prime, 1 / 3)
  const fractionalPart = cubeRoot - Math.trunc(cubeRoot)
  const bits32 = Math.trunc(fractionalPart * Math.pow(2, 32))
  //小數點後前32位元
  const binary = bits32.toString(2).padStart(32, '0')
  return binary
}

module.exports = sha256
