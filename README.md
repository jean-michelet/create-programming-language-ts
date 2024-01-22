# Créer un langage de programmation
##### Édition TypeScript
---
<a href="https://github.com/jean-michelet/create-programming-language-ts/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License"></a> <a href="https://github.com/jean-michelet/create-programming-language-ts"><img src="https://img.shields.io/github/stars/jean-michelet/create-programming-language-ts?style=social" alt="stars - create-programming-language-ts"></a>

## Sommaire
- [Pourquoi apprendre à créer un langage de programmation ?](#pourquoi-apprendre-à-créer-un-langage-de-programmation-)
- [Prérequis](#prérequis)
- [Modules](#modules)
- [EduScript](#eduscript)

---

> Si vous trouvez ce projet utile, mettez-lui une étoile pour montrer votre soutien !

## Pourquoi apprendre à créer un langage de programmation ?
C'est une question légitime, pourquoi investir du temps dans une tâche de cette complexité ? 

**Premier point**, je parle de complexité, car je suppose qu'une bonne partie des lecteurs imaginent cette complexité sur la base de leur expérience avec des langages polyvalents utilisés dans des millions de projets, mais, bonne nouvelle, créer un "langage jouet" est loin d'être autant complexe. C'est un peu comme faire des legos, on peut pousser la réflexion assez loin, mais en dernière instance, nous ne sommes pas tenus de respecter des impératifs de production.

**Deuxième point**, apprendre à créer un langage de programmation permet de mieux comprendre les outils qu'utilisent les développeurs au quotidien. Je pense évidemment à leur langage de programmation de prédilection, mais également divers outils et librairies (éditeurs de code, moteurs de templates, transpilateurs, linters...).

**Troisième point**, créer un langage de programmation permet d'implémenter des notions fondamentales en informatique théorique. Par exemple, nous verrons comment la théorie des automates s'applique au parsing.

**Quatrième point**, vous serez en mesure de créer votre propre langage. Il y a peu de chances que vous souhaitiez un jour créer un langage polyvalent de type C++, Rust, Python ou JavaScript, mais il se pourrait que vous souhaitiez développer un DSL (Domain Specific Language). SQL, un langage conçu spécifiquement pour interagir avec les systèmes de gestion de bases de données, est un exemple classique de DSL. Le composant [ExpressionLanguage](https://symfony.com/doc/current/components/expression_language.html) du projet **Symfony** est un autre exemple de DSL, qui offre un moyen flexible et puissant de configurer une application PHP.

En fonction de vos intérêts propres, je suis sûr que vous pouvez concevoir bien d'autres raisons de créer votre propre langage. Pour moi, je dirais tout simplement que c'est un projet passionnant et fun !

## Prérequis 
Ce cours s'adresse aux développeurs expérimentés et étudiants très motivés. Il nécessite une bonne maîtrise des fondamentaux de la programmation orientée objet (class-based).
Visibilité, héritage, interface, classes et méthodes abstraites doivent être des concepts parfaitement clairs pour vous.

## Modules
- [Introduction générale](https://github.com/jean-michelet/create-programming-language-ts/blob/main/fr/0/introduction.md)
- [Développer un scanner](https://github.com/jean-michelet/create-programming-language-ts/blob/main/fr/1/lexical-analysis-theory.md) (partie 1/2 uniquement)
- Développer un parser
- Développer un analyseur sémantique
- Développer une machine virtuelle

## EduScript
Le langage que nous allons développer se nomme **EduScript**, le code source se trouve dans le dossier `/eduscript`, les composants seront ajoutés progressivement lors de la publication des chapitres correspondants.

Le langage **EduScript** sera un langage typé statiquement très élémentaire avec une syntaxe très similaire à **TypeScript**. Le but est de rédiger les chapitres le plus rapidement possible afin de vous donner une vision d'ensemble. Se perdre dans des détails trop complexes, trop rapidement, aura le même effet que bon nombre de livres et cours sur le sujet, vous décourager. De plus, développer un langage très élémentaire vous donne l'opportunité de l'enrichir, et donc de véritablement progresser en vous creusant un peu les méninges. N'importe qui peut copier-coller du code, appliquer bêtement, mais ajouter sa pierre à l'édifice est une autre paire de manches.

Des ressources additionnelles vous seront communiquées lorsque que je décide de ne pas approfondir un sujet spécifique, il est de votre responsabilité d'aller les consulter.

### Éléments du Langage
Un langage de programmation est composé de 3 constructions principales : les éléments littéraux, les expressions et les instructions (Statements en anglais).

#### Littéraux
EduScript supporte les valeurs littérales suivantes :
```ts
"Hello, world!"; // strings
456; // integers
true;false; // booleans
null; // null
```

#### Expressions
EduScript supporte les expressions suivantes :
```ts
// UnaryExpression
!a;

// BinaryExpression
a + b; a - b; a * b; a / b; (a + b) * c; a == b; a != b;

// AssignmentExpression
a = 1;

// ArrayExpression
[1, 2, 3];

// MemberExpression
a[0];
```

### Instructions
EduScript supporte les instructions suivantes :
```ts
// VariableDeclaration
let x: number = 1;

// FunctionDeclaration
function add(a: number, b: number): number {
    return a + b; // Return Statement (Instruction de Retour)
}

{
    // Block-scoped Variable
    let x: string = "Another X value";
}

function incrementX(): void {
  x++; // Functions inherit parent environment
}

// IfStatement
if (x == 1) {
    x = 1;
} else {
    x = 2;
}

while (true) {
    x = x + 1;
    if (x == 5) {
        break; // BreakStatement
    }
    if (x == 3) {
        continue; // ContinueStatement
    }
}
```

---

#### Si vous trouvez ce projet utile, mettez-lui une étoile pour montrer votre soutien !
