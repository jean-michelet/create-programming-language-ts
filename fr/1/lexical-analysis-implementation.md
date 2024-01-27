
# Créer un langage de programmation - Développer un scanner 2/2
##### Édition TypeScript

> Ce cours est toujours en cours de rédaction et peut contenir des erreurs.

## Sommaire
- [Utiliser des expressions régulières](#utiliser-des-expressions-régulières)
- [Scanner *from scratch*](#scanner-from-scratch)
- [Implémentation](#implémentation)

## Utiliser des expressions régulières
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
  /^[_a-zA-Z][_a-zA-Z0-9]*/
]

function scan (input: string): string[] {
  const tokens: string[] = []

  // Nous devons suivre la position dans le code source
  let pos = 0
  while (pos < input.length) {
    tokens.push(scanToken())
  }

  function scanToken (): string {
    // Ignore les espaces
    while (pos < input.length && /\s/.test(input[pos])) {
      pos++
    }

    // Fin du fichier
    if (pos === input.length) {
      return ''
    }

    // Teste toutes les expressions régulières jusqu'à identifier le token
    for (const regex of regexList) {
      const match = input
        // input.slice(pos) coupe la chaîne à partir d'un certain index
        // par exemple, "let x = 1".slice(4) donne "x = 1"
        .slice(pos)
        // .match(regex) retourne les chaînes identifiées ou null
        .match(regex)

      if (match !== null) {
        // La pos est désormais à la fin du token identifié
        pos += match[0].length
        return match[0]
      }
    }

    // Si aucun token n'est trouvé, nous déclenchons une erreur
    // pour indiquer que le token est invalide.
    throw new SyntaxError(`Unexpected token '${input[pos]}'`)
  }

  return tokens
}
```

Prenez bien le temps de lire et de comprendre ce code, testez le dans le [Playground de typescriptlang.org](https://www.typescriptlang.org/play), il va vous aider à raisonner pour la suite.

> En JavaScript, les fonctions (entre autres) ont leur propre scope et héritent du scope parent.
> La variable `pos` est donc disponible et modifiable depuis `scanToken`.

La fonction `scan` retourne l'ensemble des tokens :
```js
console.log(scan('let x = 1;')) // ["let", "x", "=", "1", ";"] 

// throw error: Unexpected token '@' 
scan('let x = @;')
```

L'analyse lexicale peut aussi être implémentée *from scratch*. Dans ce cours, nous allons créer notre propre implémentation d'automate fini et parcourir le code source par nous-même, mais choisissez la méthode que vous préférez.

Ce qu'il est important de comprendre, c'est que vous devez garder en mémoire la position à laquelle vous vous trouvez pour matcher les tokens. Chaque fois qu'un token est identifié, on *se déplace* de la sorte : `position += token.length`.

## Scanner *from scratch*
Nous allons devoir scanner principalement 4 types de tokens.

**Les symboles** : `;`, `(`, `[`, `=`, etc.

**Les littéraux** : `14`, `"Hello world"`, etc.

**Les mots-clés** : `let`, `function`, `if`, etc.

**Les identifiants** : `myVar`, `myFunction`, `myArray`, etc.

Vous allez rapidement constater que j'utilise différentes stratégies. Parfois, j'itère avec une boucle `while`, parfois avec une boucle `for`. Parfois, je teste mes conditions avec un `switch`, parfois avec des conditions `if`. Cela permet de montrer plusieurs façons de faire, mais *je* pense sincèrement cela n'a pas beaucoup d'importance, du moment que *ça fonctionne*.

### Scanner des symboles
Scanner des symboles dans un code source est trivial :
```ts
function scanSymbols (input: string): string[] {
  const tokens: string[] = []
  for (let pos = 0; pos < input.length; pos++) {
    switch (input[pos]) {
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
        tokens.push(input[pos])
        break

      default:
        throw new SyntaxError(`Unexpected token '${input[pos]}'`)
    }
  }

  return tokens
}

console.log(scanSymbols(`
  ; .: ;;  =
`)) // [";", ".", ":", ";", ";", "="]

console.log(scanSymbols(' @ ')) // Unexpected token '@'
```

Problème : actuellement, `scanSymbols(" == ")` retourne `["=", "="]`.
Pour scanner ce type de token, il faut être en mesure de connaître les symboles suivants. 

Pour le moment, ce n'est pas compliqué :
```ts
function scanSymbols (input: string): string[] {
  const tokens: string[] = []

  for (let pos = 0; pos < input.length; pos++) {
    switch (input[pos]) {
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
        if (input[pos + 1] === '=') {
          tokens.push('==')
          // '=='.length == 2
          // Il faut donc incrémenter `pos` une fois de plus que la boucle for
          pos++
          break
        }

        // etc.
        tokens.push(input[pos])
        break

      default:
        throw new SyntaxError(`Unexpected token '${input[pos]}'`)
    }
  }

  return tokens
}

console.log(scanSymbols(' == ; ')) // ["==", ";"]

// Unexpected token 'a'
console.log(scanSymbols(' a ')) // ["==", ";"]
```

### Scanner des mots-clés
Scanner des mots-clés et des opérateurs composés de plusieurs symboles est très similaire. La principale différence réside dans le fait que les mots-clés sont composés uniquement de lettres. Mais ils peuvent être plus longs, il est donc utile de créer une fonction `followedBy` qui va nous aider à les identifier :

```ts
function scanKeyWords (input: string): string[] {
  const tokens: string[] = []

  let pos = 0
  for (;pos < input.length; pos++) {
    // Ignore whitespace chars
    if (input[pos] === ' ' || input[pos] === '\n') {
      continue
    }

    if (input[pos] === 'f') {
      if (followedBy('unction')) {
        tokens.push('function')
      } else if (followedBy('alse')) {
        tokens.push('false')
      }

      continue
    } else if (input[pos] === 'n') {
      if (followedBy('umber')) {
        tokens.push('number')
      } else if (followedBy('ull')) {
        tokens.push('null')      
      } 

      continue
    }

    // Other keywords tests...
    
    throw new SyntaxError(`Unexpected token '${input[pos]}'`)
  }

  function followedBy (chars: string): boolean {
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== input[pos + 1 + i]) {
        return false
      }
    }

    pos += chars.length // move to the next char

    return true
  }

  return tokens
}

console.log(scanKeyWords(' function false number null ')) // ["function", "false", "number", "null"]

// Unexpected token
console.log(scanKeyWords(' notAKeyword '))
```

Il faut faire très attention à l'ordre dans lequel les mots-clés sont testés. Par exemple, il faut absolument tester `else if` avant `else` :
```ts
function scanKeyWords (input: string): string[] {
  const tokens: string[] = []

  let pos = 0
  for (; pos < input.length; pos++) {
    // Ignore whitespace chars
    if (input[pos] === ' ' || input[pos] === '\n') {
      continue
    }

    if (input[pos] === 'e' && followedBy('lse')) {
      // Essayez d'inverser l'ordre des conditions et vous obtiendrez une erreur
      if (followedBy(' if')) {
        tokens.push('else if')
      } else {
        tokens.push('else')
      }

      continue
    }

    // Other keywords tests...

    throw new SyntaxError(`Unexpected token '${input[pos]}'`)
  }

  function followedBy (chars: string): boolean {
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== input[pos + 1 + i]) {
        return false
      }
    }

    pos += chars.length // move to the next char
    return true
  }

  return tokens
}

console.log(scanKeyWords(' else else if ')) // ["else", "else if"]

// Unexpected token
console.log(scanKeyWords(' notAKeyword '))
```

### Scanner des nombres
Les caractères, qu'ils soient des lettres, des chiffres ou divers symboles sont encodés.

> **Character encoding** is the process of assigning numbers to graphical 
> characters, especially the written characters of human language, allowing
> them to be stored, transmitted, and transformed using digital computers. 
> The numerical values that make up a character encoding are known as 
> "code points" and collectively comprise a "code space," a "code page," or 
> a "character map."
>
> [Wikipedia - Character encoding](https://en.wikipedia.org/wiki/Character_encoding)

Ce qui signifie que chaque caractère a une valeur numérique associée.
Et le plus beau, c'est que les lettres comme les chiffres sont positionnés dans un ordre croissant alphabétique ou numérique.


Ainsi :
```ts
console.log(
  'a' < 'z' && 'A' < 'Z' && '0' < '9' // true
)
```

Donc, savoir si un caractère est un chiffre est trivial :
```ts
function isDigit(char: string): boolean {
  return char >= '0' && char <= '9'
}
```

Suite à cela, il nous suffit de scanner les digits suivants (voir `scanNumber`) :
```ts
function scanNumbers(input: string): number[] {
  const tokens: number[] = [];

  let pos = 0;
  while (pos < input.length) {
    // Ignore whitespace chars
    if (input[pos] === ' ' || input[pos] === '\n') {
      pos++;
      continue;
    }

    if (isDigit()) {
      tokens.push(scanNumber());
      continue;
    }

    throw new SyntaxError(`Unexpected token '${input[pos]}'`);
  }

  function scanNumber(): number {
    let lexeme = input[pos++];
    while (input[pos] && isDigit()) {
      lexeme += input[pos++];
    }

    return parseInt(lexeme);
  }

  function isDigit(): boolean {
    return input[pos] >= '0' && input[pos] <= '9';
  }

  return tokens;
}
console.log(scanNumbers(' 0123 11 1239 ')); // [123, 11, 1239]

// Unexpected token 'a'
console.log(scanNumbers(' 1a '));
```

### Scanner une chaîne de caractère
Bon, ben une fois que l'on a compris comment scanner un nombre, scanner une chaîne de caractère n'est pas plus difficile. Il suffit simplement de prendre en compte les caractères l'encadrant, souvent *single quotes* `'` ou *double quotes* `"`. EduScript supporte uniquement les *double quotes*, mais rien ne vous empêche d'implémenter un support pour les *single quotes*.

```ts
function scanStrings (input: string): string[] {
  const tokens: string[] = []

  let pos = 0
  for (;pos < input.length; pos++) {
    switch (input[pos]) {
      // Ignore whitespace chars
      case ' ':
      case '\n':
        continue

      case '"':
        tokens.push(scanString())
        break

      default:
        throw new SyntaxError(`Unexpected token '${input[pos]}'`)
    }
  }

  function scanString (): string {
    let lexeme = input[pos++]
    while (input[pos] !== '' && input[pos] !== '"') {
      lexeme += input[pos++]
    }

    return lexeme + input[pos] // + closing `"`
  }

  return tokens
}

console.log(scanStrings(' "hello" "123" "" ')) // [""hello"", ""123"", """"]

// Unexpected token 'a'
console.log(scanStrings(' aaa '))

// Unexpected token '1'
console.log(scanStrings(' 111 '))
```

### Scanner un identifiant
Les identifiants sont les noms que vous donnez à vos variables, vos fonctions, etc.
Quand on y pense, scanner un identifiant et une chaîne de caractère est très similaire, mais il faut garder à l'esprit quelques règles :

Évidemment, un identifiant n'est pas encadré par des *quotes* :
```ts
"foo" // string
foo // identifiant
```

Un identifiant ne contient pas n'importe quel type de caractère, EduScript supporte les lettres, chiffres et le symbole *underscore* `_` :
```ts
 // Pas bon...
let x% = 1

// Bon
let x1_ = 1
```

Un identifiant ne commence pas par un chiffre :
```ts
// Pas bon
let 1 = 1
let 1x = 1
console.log(1 + 1x) // ???

// Bon
let a = 1
let _ = 1
```

Il faudra donc vérifier que le premier caractère est valide :
```ts
function isValidFirstCharIdentifier (char: string): boolean {
  return char === '_' || isLetter(char)
}
```

Et que l'ensemble des caractères sont alphanumériques :
```ts
function isAlpha (char: string): boolean {
  return char === '_' || isDigit(char) || isLetter(char)
}
```

Voici un exemple d'implémentation :
```ts
function scanIdentifiers (input: string): string[] {
  const tokens: string[] = []
  
  let pos = 0
  for (; pos < input.length; pos++) {
    if (input[pos] === ' ' || input[pos] === '\n') {
      continue;
    }

    if (isValidFirstCharIdentifier()) {
      tokens.push(scanIdentifier())

      continue
    }

    throw new SyntaxError(`Unexpected token '${input[pos]}'`);
  }

  function scanIdentifier() {
    let lexeme = input[pos++]
    while(input[pos] && isAlpha()) {
      lexeme += input[pos++]
    }

    return lexeme
  }

  function isAlpha (): boolean {
    return input[pos] === '_' || isDigit() || isLetter()
  }

  function isDigit(): boolean {
    return input[pos] >= '0' && input[pos] <= '9'
  }

  function isLetter(): boolean {
    return (input[pos] >= 'a' && input[pos] <= 'z') || (input[pos] >= 'A' && input[pos] <= 'Z')
  }

  function isValidFirstCharIdentifier (): boolean {
    return input[pos] === '_' || isLetter()
  }

  return tokens
}

console.log(scanIdentifiers(' x foo bar   ')) // ["x", "foo", "bar"] 

// Unexpected token '1'
console.log(scanIdentifiers(' 1x ')) 
```

#### Mot-clé ou identifiant ?
Autre problème, comment savoir si une suite de caractères est un identifiant ou un mot-clé ?

Par exemple, la première partie de l'identifiant `letter` est `let`, qui peut être confondu avec le mot-clé `let` :
```ts
let letter = "a"
```

Une technique est de toujours essayer de scanner un mot-clé en premier. Si un mot-clé est reconnu, il faut s'assurer qu'il n'est pas suivi d'un caractère alphanumérique :
```ts
function scanKeyWords (input: string): string[] {
  const tokens: string[] = []

  let pos = 0
  for (; pos < input.length; pos++) {
    if (input[pos] === ' ' || input[pos] === '\n') {
      continue
    }

    if (input[pos] === 'l' && followedBy('et')) {
      tokens.push('let')
      continue
    }

    // Other keywords tests...

    throw new SyntaxError(`Unexpected token '${input[pos]}'`)
  }

  function followedBy (chars: string): boolean {
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== input[pos + 1 + i]) {
        return false
      }
    }

    pos += chars.length + 1 // we move to the next char

    // les mots-clés ne doivent pas être suivis d'un caractère alphanumérique
    // car il peut s'agir d'un identifiant
    if (isAlpha()) {
      return false
    }

    return true
  }

  function isAlpha (): boolean {
    return input[pos] === '_' || isDigit() || isLetter()
  }

  function isDigit (): boolean {
    return input[pos] >= '0' && input[pos] <= '9'
  }

  function isLetter (): boolean {
    return (input[pos] >= 'a' && input[pos] <= 'z') || (input[pos] >= 'A' && input[pos] <= 'Z')
  }

  return tokens
}

console.log(scanKeyWords(' let let   let let ')) // ["let", "let", "let", "let"]

// Unexpected token 't'
console.log(scanKeyWords(' letter '))
```

### Scanner les commentaires

Je vous laisse le faire ?

EduScript supporte les commentaires sur une ligne, comme sur plusieurs lignes :
```ts
// Commentaire sur une ligne
/*
 Commentaire sur plusieurs lignes
*/
```
Le caractère de retour à la ligne est `\n`.

Si vous souhaitez aller plus loin, vous pouvez compter le nombre de lignes sur lesquelles s'étend le commentaire.

## Implémentation
Je pense que je vous ai donné suffisamment d'outils pour vous permettre de procéder à l'implémentation par vous-même. Je vais maintenant vous donner les structures que nous allons manipuler ainsi qu'une partie de la classe `Scanner`, que vous devrez terminer d'implémenter. Prenez le temps de bien lire [le code source](https://github.com/jean-michelet/create-programming-language-ts/tree/main/eduscript/src/scanner), de le comprendre et essayez d'ajouter de nouveaux tokens.

Ne vous sentez pas mal si vous ne parvenez à implémenter par vous-même, que ce soit par manque d'expérience ou de temps. L'essentiel est que vous compreniez bien l'intérêt du scanner. En revanche, il vous faudra tout de même récupérer le code source, car vous en aurez besoin pour les prochains chapitres.

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

> Note : le symbole `|` signifie **union**, le type peut donc être une des valeurs précisés dans `TokenValue`.

### **TokenType**:
Énumération définissant tous les tokens de notre langage :

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

Dans cet exemple, `Scanner` ne peut générer qu'un seul token à la fois via la méthode `scanToken (): Token`. 

Il est possible de construire une pile (stack) de tokens et procéder à l'analyse syntaxique en récupérant les tokens dans cette pile. C'est ce que nous avons fait dans les exemples jusqu'ici. Il est également possible de scanner un token uniquement lorsque l'on en a besoin depuis le parser, c'est que nous allons faire par la suite. Encore une fois, libre à vous d'ajouter une nouvelle méthode pour récupérer une pile de tokens.

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
      lexeme: type === TokenType.Eof ? '' : lexeme,
      value,
      startLine: this._startLine,
      endLine: this._endLine,
      startPos: this._startTokenPos,
      endPos: this._endTokenPos
    }
  }
}
```

Bonne chance !
