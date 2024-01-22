
# Créer un langage de programmation - Développer un scanner 1.2
##### Édition TypeScript

> Ce chapitre est toujours en cours de rédaction et peut contenir des erreurs.


L'**analyseur lexical**, souvent appelé **scanner** ou **tokenizer**, est l'outil chargé de réaliser l'analyse lexicale.

Nous avons vu au chapitre précédent que nous pouvons utiliser un **automate fini** pour identifier nos différents tokens. Tout automate fini peut être décrit par une expression régulière, il est donc possible d'utiliser un moteur d'expression régulière pour implémenter notre scanner.

Par exemple avec ce type d'algorithme :
```ts
const regexList: RegExp[] = [
  // Symboles
  /^=/,
  /^;/,

  // Littéraux
  /^\d+/,

  // Mots-clés
  /^\blet\b/,

  // Identifiants
  /^[_a-zA-Z][_a-zA-Z0-9]*/,
];

function scan(input: string): string[] {
  const tokens: string[] = [];

  // Nous devons suivre la position dans le code source
  let position = 0;
  while (position < input.length) {
    const currentToken = scanToken(input);
    tokens.push(currentToken);
  }

  function scanToken(input: string): string {
    // Ignore les espaces
    while (position < input.length && /\s/.test(input[position])) {
      position++;
    }

    // Fin du fichier
    if (position === input.length) {
      return '';
    }

    // Essaye toutes les expressions régulières jusqu'à ce qu'il en trouve une qui reconnaît un token
    // à cet emplacement précis dans le code source
    for (const regex of regexList) {
      const match = input
        // input.slice(position) coupe la chaîne à partir d'un certain index
        // par exemple, "let x = 1".slice(4) donne "x = 1"
        .slice(position)
        // .match(regex) retourne les chaînes identifiées ou null 
        .match(regex);

      if (match !== null) {
        // La position est désormais à la fin du token identifié
        position += match[0].length;
        return match[0];
      }
    }

    // Si aucun token n'est trouvé, nous déclenchons une erreur 
    // pour indiquer que ce token n'est pas valide.
    throw new SyntaxError(`Unexpected token '${input[position]}'`);
  }

  return tokens;
}
```

Prenez bien le temps de lire et de comprendre ce code, testez le dans le [Playground de typescriptlang.org](https://www.typescriptlang.org/play), il va vous aider à raisonner pour la suite.

> En JavaScript, les fonctions (entre autres) ont leur propre scope et héritent du scope parent.
> La variable `position` est donc disponible et modifiable depuis `scanToken`.

La fonction `scan` retourne l'ensemble des tokens :
```js
console.log(scan('let x = 1;')) // ["let", "x", "=", "1", ";"] 

// throw error: Unexpected token '@' 
scan('let x = @;')
```

L'analyse lexicale peut aussi être implémentée *from scratch*. Dans ce cours, nous allons créer notre propre implémentation d'automate fini et parcourir le code source par nous-même, mais choisissez la méthode que vous préférez.

Ce qu'il est important de comprendre, c'est que vous devez garder en mémoire la position à laquelle vous vous trouvez pour matcher les tokens. Chaque fois qu'un token est identifié, on *se déplace* de la sorte : `position += token.length`.

## Algorithmes d'analyse
Nous allons devoir scanner 4 types de tokens.

**Les symboles** : `;`, `(`, `[`, `=`, etc.

**Les littéraux** : `14`, `"Hello world"`, etc.

**Les mots-clés** : `let`, `function`, `if`, etc.

**Les identifiants** : `myVar`, `myFunction`, `myArray`, etc.

### Scanner des symboles
Scanner des symboles dans un code source est trivial :
```ts
function scanSymbols (input: string) {
  const symbolTokens: string[] = []
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    switch (char) {
      // Ignore whitespace chars
      case ' ':
      case '\n':
        continue

        // Symbols
      case '.':
      case ':':
      case ';':
      case '=':
        // etc.
        symbolTokens.push(char)
        break

      default:
        throw new SyntaxError(`Unexpected token '${char}'`)
    }
  }

  return symbolTokens
}

console.log(scanSymbols(`
  ; .: ;;  =
`)) // [";", ".", ":", ";", ";", "="]

console.log(scanSymbols(' @ ')) // Unexpected token '@'
```

Ça devient légèrement plus subtil lorsque l'on a des séquences de plusieurs symboles, par exemple l'opérateur `==`.

Actuellement, `scanSymbols(" == ")` retourne `["=", "="]`.
Pour scanner ce type de token, il faut être en mesure de connaître les symboles suivants. Ici, pas besoin de trop se prendre la tête :
```ts
function scanSymbols (input: string) {
  const symbolTokens: string[] = []
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    switch (char) {
      // Ignore whitespace chars
      case ' ':
      case '\n':
        continue

        // Symbols
      case '.':
      case ':':
      case ';':
      case '=':
        // Si le caractère suivant est '=', on sait que le token est '=='
        if (input[i + 1] == '=') {
          symbolTokens.push('==')
          i++
          break
        }
        // etc.
        symbolTokens.push(char)
        break

      default:
        throw new SyntaxError(`Unexpected token '${char}'`)
    }
  }

  return symbolTokens
}

console.log(scanSymbols(' == ; ')) // ["==", ";"] 
```

### Scanner des mots-clés
Scanner des mots-clés et des opérateurs composés de plusieurs symboles est très similaire.
La principale différence réside dans le fait que les mots-clés sont composés uniquement de lettres.
Mais ils peuvent être plus longs, il peut donc être bénéfique de créer une fonction `followedBy` qui va nous aider à les identifier :

```ts
function scanKeyWords (input: string) {
  const symbolTokens: string[] = []
  
  let position = 0
  for (; position < input.length; position++) {
    const char = input[position]
    switch (char) {
      // Ignore whitespace chars
      case ' ':
      case '\n':
        continue

      case 'f':
        if (followedBy('unction')) {
          symbolTokens.push('function')
          break
        }

        if (followedBy('alse')) {
          symbolTokens.push('false')
          break
        }

        case 'n':
            if (followedBy('umber')) {
                symbolTokens.push('number')
                break
            }

            if (followedBy('ull')) {
            symbolTokens.push('null')
            break
            }

      default:
        throw new SyntaxError(`Unexpected token '${char}'`)
    }
  }

  function followedBy (chars: string): boolean {

    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== input[position + 1 + i]) {
        return false
      }
    }
    position += chars.length

    return true
  }

  return symbolTokens
}

console.log(scanKeyWords(' function false number null ')) // ["function", "false", "number", "null"]
```

### Scanner un nombres entier

### Scanner une chaîne de caractère

### Scanner un identifiant

### Scanner les commentaires

## Implémentation
Je vais maintenant vous donner les structures que nous allons manipuler ainsi qu'une partie de la classe `Scanner`, que vous devrez terminer d'implémenter. Si jamais vous êtes bloqué, il vous suffit de chercher la solution [dans le code source](https://github.com/jean-michelet/create-programming-language-ts/tree/main/eduscript/src/scanner).

### **Token**
Lors de l'analyse lexicale, nous souhaitons récupérer plusieurs informations, pas uniquement le lexème. Nous allons avoir besoin de connaître le type et la valeur qu'il contient. Pour aider les utilisateurs de notre langage à débugger ou manipuler le code source, il peut être utile de récupérer des informations sur sa position dans le code source.

Interface décrivant la structure d'un token :
```ts
interface Token {
  type: TokenType
  value: TokenValue
  lexeme: string
  startLine: number
  endLine: number
  startToken: number
  endToken: number
}
```
> Note : l'interface peut facilement être remplacée par une classe ou autre structure.

### **TokenValue** : 
Ce type est utilisé pour représenter la valeur associée à un token. Par exemple, un token représentant le nombre `42` a un `TokenValue` de type `number` et contient la valeur `42`. 

Les différents types possibles sont (vous pouvez en ajouter.) :
```ts
type TokenValue = string | number | boolean | null
```

> Note : le symbole "|" signifie "union", le type peut donc être une des valeurs précisés dans `TokenValue`.

### **TokenType**:
Énumération définissant tous les types de tokens de notre langage :

```ts
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
```

### Scanner
La classe `Scanner` est responsable de la lecture du code source et de la production de tokens.

Dans cet exemple, `Scanner` possède uniquement une méthode `scanToken (): Token`. Il est possible de construire une pile de tokens et procéder à l'analyse syntaxique en récupérant les tokens dans cette pile, mais il est également possible de scanner les tokens les uns après les autres à la demande du parser.

```ts
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

  // Permet d'utiliser la même instance plusieurs fois
  init (src: string = ''): void {
    this._src = src
    this._startLine = 1
    this._endLine = 1
    this._startTokenPos = 0
    this._endTokenPos = 0
  }

  scanToken (): Token {
    // Si nous sommes à la fin du fichier
    if (this._EOF()) {
      return this._createToken(TokenType.Eof)
    }

    this._startLine = this._endLine
    this._startTokenPos = this._endTokenPos

    this._skipComments()

    const char = this._advance()
    if (this._isWhitespaceChar(char)) {
      if (char === '\n') this._endLine++

      return this.scanToken()
    }

    // Si ça commence par un chiffre, c'est un nombre
    if (this._isDigit(char)) {
      return this._number()
    }

    const symbol = this._tryScanningSymbol(char)
    if (symbol !== null) {
      return symbol
    }

    // Si ce n'est pas un symbole, c'est peut-être un mot-clé
    const keywordToken = this._tryScanningKeyword(char)
    if (keywordToken !== null) {
      return keywordToken
    }

    // Si ce n'est pas un mot-clé, c'est peut-être un identifiant
    if (this._isValidFirstCharIdentifier(char)) {
      return this._identifier()
    }

    throw new SyntaxError(`Unexpected token '${char}' at line ${this._startLine}`)
  }

  private _tryScanningSymbol (char: string): Token | null {}

  private _tryScanningKeyword (char: string): Token | null {}

  // Ignore les commentaires
  // Ne pas oublier de compter les lignes et d'incrémenter `_startTokenPos`
  private _skipComments (): void {}

  // Retourne un token de type Identifier
  private _identifier (): Token {}

  // Retourne un token de type String
  private _string (): Token {}

  // Retourne un token de type Number
  private _number (): Token {}

  // Retourne un token de type Boolean
  private _boolean (): Token {}

  // Teste si le caractère actuel est suivi d'une suite de caractère spécifique
  private _followedBy (chars: string): boolean {}

  // Le 1er caractère d'un identifiant doit être une lettre ou un underscore `_`
  private _isValidFirstCharIdentifier (char: string): boolean {}

  private _isDigit (char: string): boolean {}

  private _isLetter (char: string): boolean {}

  private _isAlpha (char: string): boolean {}

  private _isWhitespaceChar (char: string): boolean {}

  private _EOF (): boolean {
    return this._endTokenPos >= this._src.length
  }

  // récupère le caractère actuel
  private _peek (): string {
    if (this._EOF()) {
      return ''
    }

    return this._src.charAt(this._endTokenPos)
  }

  // récupère le caractère présent à une position spécifique
  private _peekAt (pos = 1): string {
    if (this._endTokenPos + pos >= this._src.length) {
      return ''
    }

    return this._src.charAt(this._endTokenPos + pos)
  }

  // avance d'un caractère
  private _advance (): string {
    return this._src.charAt(this._endTokenPos++)
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
```

### Conclusion
L'analyse lexical est une étape essentielle dans le processus de compilation ou d'interprétation. Il prépare le terrain pour les étapes ultérieures en transformant le code source en une suite de tokens, facilitant ainsi l'analyse syntaxique. Procéder à l'analyse lexicale peut se faire en parallèle de l'analyse syntaxique, le parser faisant appel au scanner lorsqu'il a besoin du token suivant.