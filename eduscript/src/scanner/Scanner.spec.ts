import { test } from 'node:test'
import assert from 'node:assert'

import Scanner from './Scanner.js'
import { TokenType, printTokenType } from './Token.js'

const scanner = new Scanner()

function testScanToken (lexeme: string, tokenType: TokenType): void {
  void test(`should scan a token of type '${printTokenType(tokenType)}'`, () => {
    scanner.init(lexeme)
    const token = scanner.scanToken()
    assert.strictEqual(token.type, tokenType)
    assert.strictEqual(token.lexeme, lexeme)
    assert.strictEqual(token.startPos, 0)
    assert.strictEqual(token.endPos, token.lexeme.length)
  })
}

const testFixtures = [
  // symboles
  ['.', TokenType.Dot],
  [':', TokenType.Colon],
  [';', TokenType.SemiColon],
  [',', TokenType.Coma],
  ['(', TokenType.LeftParen],
  [')', TokenType.RightParen],
  ['{', TokenType.LeftCBrace],
  ['}', TokenType.RightCBrace],
  ['[', TokenType.LeftBracket],
  [']', TokenType.RightBracket],

  // arithmetic operators
  ['+', TokenType.Additive],
  ['-', TokenType.Additive],
  ['*', TokenType.Multiplicative],
  ['/', TokenType.Multiplicative],

  // equality operators
  ['!', TokenType.Not],
  ['==', TokenType.Equal],
  ['!=', TokenType.NotEqual],
  ['=', TokenType.Assign],

  // keywords
  ['let', TokenType.Let],
  ['function', TokenType.Function],
  ['if', TokenType.If],
  ['else', TokenType.Else],
  ['while', TokenType.While],
  ['return', TokenType.Return],
  ['break', TokenType.Break],
  ['continue', TokenType.Continue],
  ['foo', TokenType.Identifier],

  // built-in types
  ['number', TokenType.Type],
  ['string', TokenType.Type],
  ['boolean', TokenType.Type],
  ['void', TokenType.Type]
] satisfies Array<[string, TokenType]>

for (const [lexeme, tokenType] of testFixtures) {
  testScanToken(lexeme, tokenType)
}

void test('should skip comments', () => {
  scanner.init(`
      // this is a single-line comment
      /**
       * This is a multi-line comment
       */
      14
    `)
  const token = scanner.scanToken()
  assert.strictEqual(token.type, TokenType.Number)
  assert.strictEqual(token.lexeme, '14')
  assert.strictEqual(token.value, 14)
  assert.strictEqual(token.startLine, 6)
  assert.strictEqual(token.endLine, 6)
})

void test('should accept identifiers starting with keyword substring, e.i. `letter` (starts with `let`)', () => {
  scanner.init('letVar whileVar')
  let token = scanner.scanToken()
  assert.strictEqual(token.type, TokenType.Identifier)
  assert.strictEqual(token.lexeme, 'letVar')

  token = scanner.scanToken()
  assert.strictEqual(token.type, TokenType.Identifier)
  assert.strictEqual(token.lexeme, 'whileVar')
})

void test(`should scan a token of type '${printTokenType(TokenType.String)}'`, () => {
  scanner.init('"Hello world"')
  const token = scanner.scanToken()
  assert.strictEqual(token.type, TokenType.String)
  assert.strictEqual(token.lexeme, '"Hello world"')
  assert.strictEqual(token.value, 'Hello world')
})

void test(`should scan a token of type ${printTokenType(TokenType.Number)}`, () => {
  scanner.init('123')
  const token = scanner.scanToken()
  assert.strictEqual(token.type, TokenType.Number)
  assert.strictEqual(token.lexeme, '123')
  assert.strictEqual(token.value, 123)
})

void test('should scan a token of type boolean', () => {
  scanner.init('true false')
  let token = scanner.scanToken()
  assert.strictEqual(token.type, TokenType.Boolean)
  assert.strictEqual(token.lexeme, 'true')
  assert.strictEqual(token.value, Boolean(true))

  token = scanner.scanToken()
  assert.strictEqual(token.type, TokenType.Boolean)
  assert.strictEqual(token.lexeme, 'false')
  assert.strictEqual(token.value, false)
})

void test('should skip white spaces', () => {
  scanner.init('   12')
  const token = scanner.scanToken()
  assert.strictEqual(token.type, TokenType.Number)
  assert.strictEqual(token.lexeme, '12')
  assert.strictEqual(token.value, 12)
})

void test('should keep track of the current line', () => {
  scanner.init(`

    12`)
  let token = scanner.scanToken()
  assert.strictEqual(token.lexeme, '12')
  assert.strictEqual(token.startLine, 3)
  assert.strictEqual(token.endLine, 3)

  scanner.init('\n\n 12')
  token = scanner.scanToken()
  assert.strictEqual(token.lexeme, '12')
  assert.strictEqual(token.startLine, 3)
})

void test('should throw an error on invalid token', () => {
  scanner.init('@;')
  assert.throws(() => scanner.scanToken(), { message: "Unexpected token '@' at line 1" })
})
