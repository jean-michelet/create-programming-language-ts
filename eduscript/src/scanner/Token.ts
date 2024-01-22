export type TokenValue = string | number | boolean | null

export interface Token {
  readonly type: TokenType
  readonly lexeme: string
  readonly value: TokenValue
  readonly startLine: number
  readonly endLine: number
  readonly startPos: number
  readonly endPos: number
}

export enum TokenType {
  // symbols
  Dot,
  Colon,
  SemiColon,
  Coma,
  LeftParen,
  RightParen,
  LeftCBrace,
  RightCBrace,
  LeftBracket,
  RightBracket,

  // arithmetic operators
  Additive,
  Multiplicative,

  // equality operators
  Not,
  Equal,
  NotEqual,

  // relational operators

  // logical operators

  // assignment operators
  Assign,

  // literals
  Number,
  String,
  Boolean,

  // keywords
  Let,
  Function,
  If,
  Else,
  While,
  Return,
  Break,
  Continue,

  // Types
  Type,

  // Identifier
  Identifier,

  // Others
  Eof,
}

export function printTokenType (token: TokenType): string {
  switch (token) {
    // symbols
    case TokenType.Dot: return '.'
    case TokenType.Colon: return ':'
    case TokenType.SemiColon: return ';'
    case TokenType.Coma: return ','
    case TokenType.LeftParen: return '('
    case TokenType.RightParen: return ')'
    case TokenType.LeftCBrace: return '{'
    case TokenType.RightCBrace: return '}'
    case TokenType.LeftBracket: return '['
    case TokenType.RightBracket: return ']'

      // arithmetic operators
    case TokenType.Additive: return '+'
    case TokenType.Multiplicative: return '*'

      // equality operators
    case TokenType.Not: return '!'
    case TokenType.Equal: return '=='
    case TokenType.NotEqual: return '!='

      // assignment operators
    case TokenType.Assign: return '='

      // literals
    case TokenType.Number: return 'Number'
    case TokenType.String: return 'String'
    case TokenType.Boolean: return 'Boolean'

      // keywords
    case TokenType.Let: return 'Let'
    case TokenType.Function: return 'Function'
    case TokenType.If: return 'If'
    case TokenType.Else: return 'Else'
    case TokenType.While: return 'While'
    case TokenType.Return: return 'Return'
    case TokenType.Break: return 'Break'
    case TokenType.Continue: return 'Continue'

      // Types
    case TokenType.Type: return 'Type'

      // Identifier
    case TokenType.Identifier: return 'Identifier'

      // Others
    case TokenType.Eof: return 'Eof'
    default: return '' // Handle unknown token types
  }
}
