import { Token, TokenType, TokenValue } from './Token'

export interface ScannerInterface {
  init: (src: string) => void
  scanToken: () => Token
}

export default class Scanner implements ScannerInterface {
  private _src = ''
  private _startLine = 1
  private _endLine = 1
  private _startTokenPos = 0
  private _endTokenPos = 0

  init (src: string = ''): void {
    this._src = src
    this._startLine = 1
    this._endLine = 1
    this._startTokenPos = 0
    this._endTokenPos = 0
  }

  scanToken (): Token {
    if (this._EOF()) {
      return this._createToken(TokenType.Eof)
    }

    this._startLine = this._endLine
    this._startTokenPos = this._endTokenPos

    const char = this._advance()
    if (this._isWhitespaceChar(char)) {
      if (char === '\n') this._endLine++

      return this.scanToken()
    }

    if (char === '/' && (this._peek() === '/' || this._peek() === '*')) {
      return this._skipComments()
    }

    if (this._isDigit(char)) {
      return this._number()
    }

    const symbol = this._tryScanningSymbol(char)
    if (symbol !== null) {
      return symbol
    }

    const keywordToken = this._tryScanningKeyword(char)
    if (keywordToken !== null) {
      return keywordToken
    }

    if (this._isValidFirstCharIdentifier(char)) {
      return this._identifier()
    }

    throw new SyntaxError(`Unexpected token '${char}' at line ${this._startLine}`)
  }

  private _tryScanningSymbol (char: string): Token | null {
    switch (char) {
      case '"':
        return this._string()

      // Symbols
      case '.':
        return this._createToken(TokenType.Dot)
      case ':':
        return this._createToken(TokenType.Colon)
      case ';':
        return this._createToken(TokenType.SemiColon)
      case ',':
        return this._createToken(TokenType.Coma)
      case '(':
        return this._createToken(TokenType.LeftParen)
      case ')':
        return this._createToken(TokenType.RightParen)
      case '{':
        return this._createToken(TokenType.LeftCBrace)
      case '}':
        return this._createToken(TokenType.RightCBrace)

      // arithmetic operators
      case '+':
      case '-':
        return this._createToken(TokenType.Additive)
      case '*':
      case '/':
        return this._createToken(TokenType.Multiplicative)

        // relational operators

      // assignment operators
      case '=':
        if (this._peek() === '=') {
          this._advance()
          return this._createToken(TokenType.Equal)
        }

        return this._createToken(TokenType.Assign)
      case '!':
        if (this._peek() === '=') {
          this._advance()
          return this._createToken(TokenType.NotEqual)
        }

        return this._createToken(TokenType.Not)
    }

    return null
  }

  private _tryScanningKeyword (char: string): Token | null {
    switch (char) {
      case 'b':
        if (this._followedBy('reak')) {
          return this._createToken(TokenType.Break)
        }
        if (this._followedBy('oolean')) {
          return this._createToken(TokenType.Type)
        }
        break

      case 'c':
        if (this._followedBy('ontinue')) {
          return this._createToken(TokenType.Continue)
        }
        break

      case 'e':
        if (this._followedBy('lse')) {
          return this._createToken(TokenType.Else)
        }
        break

      case 'f':
        if (this._followedBy('unction')) {
          return this._createToken(TokenType.Function)
        }
        if (this._followedBy('alse')) {
          return this._boolean()
        }
        break

      case 'i':
        if (this._followedBy('f')) {
          return this._createToken(TokenType.If)
        }
        break

      case 'l':
        if (this._followedBy('et')) {
          return this._createToken(TokenType.Let)
        }
        break

      case 'n':
        if (this._followedBy('umber')) {
          return this._createToken(TokenType.Type)
        }
        if (this._followedBy('ull')) {
          return this._createToken(TokenType.Type)
        }
        break

      case 'r':
        if (this._followedBy('eturn')) {
          return this._createToken(TokenType.Return)
        }
        break

      case 's':
        if (this._followedBy('tring')) {
          return this._createToken(TokenType.Type)
        }
        break

      case 't':
        if (this._followedBy('rue')) {
          return this._boolean()
        }
        break

      case 'v':
        if (this._followedBy('oid')) {
          return this._createToken(TokenType.Type)
        }
        break

      case 'w':
        if (this._followedBy('hile')) {
          return this._createToken(TokenType.While)
        }
        break

      default:
        break
    }

    return null
  }

  private _skipComments (): Token {
    // Single line comment
    if (this._peek() === '/') {
      while (this._peek() !== '\n' && !this._EOF()) {
        this._advance()
      }

      return this.scanToken()
    }

    // Multi-line comment
    while (!this._EOF()) {
      if (this._peek() === '*' && this._peekAt(1) === '/') {
        this._advance()
        this._advance()
        break
      }

      if (this._advance() === '\n') {
        this._endLine++
      }
    }

    return this.scanToken()
  }

  private _identifier (): Token {
    while (this._isAlpha(this._peek())) {
      this._advance()
    }

    const token = this._createToken(TokenType.Identifier)

    return token
  }

  private _string (): Token {
    this._advance()
    while (this._peek() !== '"') {
      this._advance()
    }

    const string = this._src.substring(this._startTokenPos + 1, this._endTokenPos)

    this._advance()

    return this._createToken(TokenType.String, string)
  }

  private _number (): Token {
    while (this._isDigit(this._peek())) {
      this._advance()
    }

    const value = parseInt(
      this._src.substring(this._startTokenPos, this._endTokenPos)
    )

    return this._createToken(TokenType.Number, value)
  }

  private _boolean (): Token {
    const value = this._src.substring(this._startTokenPos, this._endTokenPos) === 'true'

    return this._createToken(TokenType.Boolean, value)
  }

  private _followedBy (chars: string): boolean {
    let i = 1
    for (; i < chars.length; i++) {
      if (chars[i] !== this._peekAt(i)) {
        return false
      }
    }

    // keywords must not be followed by an alpha char because it might be an identifier or another keyword
    // e.g. `let` keyword vs `letter` identifier
    if (this._isAlpha(this._peekAt(i))) {
      return false
    }

    this._endTokenPos += chars.length

    return true
  }

  private _peek (): string {
    if (this._EOF()) {
      return ''
    }

    return this._src.charAt(this._endTokenPos)
  }

  private _peekAt (pos = 1): string {
    if (this._endTokenPos + pos >= this._src.length) {
      return ''
    }

    return this._src.charAt(this._endTokenPos + pos)
  }

  private _advance (): string {
    return this._src.charAt(this._endTokenPos++)
  }

  // identifier can only start by a letter or `_`
  private _isValidFirstCharIdentifier (char: string): boolean {
    return this._isLetter(char) || char === '_'
  }

  private _isDigit (char: string): boolean {
    return char >= '0' && char <= '9'
  }

  private _isLetter (char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
  }

  private _isAlpha (char: string): boolean {
    return char === '_' || this._isDigit(char) || this._isLetter(char)
  }

  private _isWhitespaceChar (char: string): boolean {
    return [' ', '\r', '\t', '\n'].includes(char)
  }

  private _EOF (): boolean {
    return this._endTokenPos >= this._src.length
  }

  private _createToken (type: TokenType, value: TokenValue = null): Token {
    const lexeme = this._src.substring(
      this._startTokenPos,
      this._endTokenPos
    )

    return {
      type,
      lexeme,
      value,
      startLine: this._startLine,
      endLine: this._endLine,
      startPos: this._startTokenPos,
      endPos: this._endTokenPos
    }
  }
}
