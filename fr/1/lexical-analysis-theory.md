# Créer un langage de programmation - Développer un scanner 1/2
##### Édition TypeScript

> Ce cours est toujours en cours de rédaction et peut contenir des erreurs.

## Sommaire

- [Introduction à l'analyse lexicale](#introduction-à-lanalyse-lexicale)
- [Alphabets, Langages et Grammaires](#alphabets-langages-et-grammaires)
- [Langages réguliers](#langages-réguliers)
- [Automates finis](#automates-finis)

## Introduction à l'analyse lexicale
Comme nous l'avons vu dans le chapitre d'introduction, l'analyse lexicale est l'analyse et le découpage d'un code source en une suite de tokens. Le programme en charge de l'analyse lexicale est généralement appelé **scanner**, **lexer** ou **tokenizer**. 

### Les tokens
Chaque token peut être défini par un type et un lexème, qui est sa représentation textuelle dans le code source. 

Quelques exemples :
| Type                                          | Lexèmes                                    |
|-----------------------------------------------|--------------------------------------------|
| Littéral                                      | `2`, `true`, `"hello"`                     |
| Mot-clé                                       | `if`, `while`, `class`                     |
| Opérateur                                     | `+`, `=`, `>=`, `&&`                       |
| Identifiant (nom de variable, fonction, etc)  | `x`, `printf`                              |

### Exemple d'analyse lexicale
Prenons l'instruction suivante :
```js
let x = 10;
```

Le scanner la découpe en plusieurs tokens :
- `let` (Mot-clé)
- `x` (Identifiant)
- `=` (Opérateur)
- `10` (Littéral - number)
- `;` (Symbole)

Les tokens peuvent être décrits par des expressions régulières. Il est donc possible d'utiliser un moteur d'expression régulière pour les identifier, et même les extraire du code source. Par exemple, JavaScript propose la classe `RegExp` :

```js
const stringRegex = new RegExp(`^"[^"]*"$`);

console.log(stringRegex.test(`"hello world"`)); // true
console.log(stringRegex.test(`"123"`)); // true
console.log(stringRegex.test(`hello world`)); // false
console.log(stringRegex.test(`123`)); // false
```

> **Astuce JS** : vous pouvez définir une instance de RegExp de manière plus concise avec la syntaxe suivante :

> ```ts 
> const stringRegex = /^"[^"]*"$/
> ```

Ci-dessus, nous souhaitons détecter un token littéral correspondant à une chaîne de caractère. Cependant, il est tout à fait possible d'atteindre le même objectif avec une fonction :

```ts
function acceptString(src) {
  let i = 0;
  if (src[i++] !== `"`) return false;

  while (src[i] && src[i] !== `"`) i++;

  return src[i] === `"` && !src[i+1];
}

console.log(acceptString(`"hello world"`)); // true
console.log(acceptString(`"123"`)); // true
console.log(acceptString(`hello world`)); // false
console.log(acceptString(`123`)); // false
```

Les moteurs d'expressions régulières sont un moyen de générer ce type de programme dynamiquement. Ces programmes peuvent être représentés sous forme de modèle mathématique appelé [**automate fini**](#automates-finis), nous allons y venir.

## Alphabets, Langages et Grammaires
Avant de débuter l'implémentation, il peut être bénéfique de comprendre quelques concepts clé de la théorie des langages formels.

### Langages naturels et langages formels
Commençons par bien distinguer langages naturels et langages formels.

Les **langages naturels** sont ceux que nous utilisons au quotidien, comme le français ou l’anglais. Ils sont marqués par des nuances, des contextes, sous-entendus et évoluent constamment.

Les **langages formels** suivent un ensemble de règles strictes : grammaire formelle. Ils excluent toute incertitude et toute ambiguïté.

Vous vous en doutez probablement, pour créer un langage de programmation, nous avons besoin d'une grammaire formelle. Donc, dans ce cours, lorsque nous évoquerons les termes « alphabet », « mot » et « grammaire », nous nous référons strictement aux langages formels.

### Alphabets et mots
Un alphabet est un ensemble **fini** et **non-vide** de symboles. Ces symboles peuvent être assemblés pour former des **mots** (ou **strings** en anglais). 

- **fini**, car contient un nombre fini de symboles.
- **non-vide**, car contient au moins un symbole.

Par convention, un alphabet est souvent désigné par la lettre **Σ** (se prononce Sigma).

#### Exemple 1
À partir de cet alphabet :
```
Σ = { 1, 2, 3 }
```
Nous pouvons créer les mots  : `1`, `12`, `123`, `321`, etc.

#### Exemple 2
À partir de cet alphabet :
```
Σ = { +, -, = }
```
Nous pouvons créer les mots : `+`, `-`, `=`, `+=`, `-=`, `==`, `===`, etc.

### Langages
Un **langage** est un ensemble de mots formés à partir d'un **alphabet**. Il peut contenir un nombre fini ou infini de mots.

#### Exemple de langage fini
```
Σ = { a, b }
L1 = { aa, bb }
```

Ici, **L1** contient uniquement les mots `aa` et `bb`.

#### Exemple de langage infini
Considérons le langage **L2** défini sur un alphabet **Σ**, composé de l'ensemble des mots de taille **n >= 1** qu'il est possible de créer avec les symboles `{ a, b }` et délimités par le symbole `%`. 

Pour :
```
Σ = { %, a, b }
```

**L2** prend la forme suivante :
```
L2 = { %aa%, %ab%, %bb%, %bba%, %aabbaaab%, ... }
```

### Langages réguliers
**L1** et **L2** sont des langages formels dits réguliers (ou rationnels). Un langage régulier est un langage qui est accepté par un [**automate fini**](#automates-finis).

[Stephen Cole Kleene](https://fr.wikipedia.org/wiki/Expression_r%C3%A9guli%C3%A8re) a inventé les expressions régulières pour représenter ce type de langage, voici **L2** sous forme d'expression régulière :
```
%[ab]+%
```

```js
const regex = /%[ab]+%/

console.log(regex.test("%a%")) // true
console.log(regex.test("%b%")) // true
console.log(regex.test("%abaaabbb%")) // true
console.log(regex.test("ab")) // false
console.log(regex.test("ab%")) // false
console.log(regex.test("%ab")) // false
```

Maintenant, souvenez-vous de l'expression régulière permettant de scanner un token de type **string** : 
```
"[^"]*"
```

On y observe la présence du symbole `*`, il s'agit de [l'étoile de Kleene](https://fr.wikipedia.org/wiki/%C3%89toile_de_Kleene), en référence au mathématicien dont on vient de parler. Elle indique ici qu'un caractère dans `[^"]` (soit, tout caractère à l'exception de `"`) peut apparaître zéro ou plusieurs fois. Donc `""`, `"Hello, world!"` sont des chaînes acceptées par `"[^"]*"`.

Autre exemple, l'expression régulière `a*`, accepte les mots `ε`, `a`, `aa`, `aaa`, etc.

> `ε` (epsilon) est le symbole utilisé pour représenter le mot vide, c'est-à-dire ne contenant aucun symbole.

Si nous souhaitons accepter l'ensemble des mots de **L2**, ainsi que le mot `%%`, il suffit d'ajuster notre expression régulière en utilisant l'étoile de Kleene :
```js
console.log(/%[ab]*%/.test("%%"))
```

## Automates finis
Un **automate fini**, également connu sous le nom de machine à états fini, est un modèle mathématique utilisé en sciences informatiques pour reconnaître et analyser des motifs ou des séquences au sein d'un texte ou d'une chaîne de symboles. Dans le contexte de l'analyse lexicale, ce modèle est pertinent, car il permet d'identifier des tokens (symboles, mots-clés, chaînes de caractères...) dans un code source.

### Structure d'un automate fini
* **États** : ils représentent les positions ou situations possibles de l'automate.
* **Transitions** : les déplacements d'un état à un autre pour un symbole donné.
* **État de départ** : l'état initial où l'automate débute son parcours.
* **États d'acceptation** : atteindre ces états signifie que l'automate a reconnu le motif recherché.

### Automates Finis Déterministes
Un **automate fini déterministe** ou **DFA** (Deterministic Finite Automaton) en anglais, reconnaît des motifs simples et déterministes. Un DFA est déterministe car il ne peut effectuer qu'une seule transition pour un même symbole depuis un état donné.

Prenons l'exemple d'un **DFA** pour le langage **L1** :
```
L1 = { ab }
```

| ![Automate /^ab$/](./1-automate-ab.png) |
|:--:| 
| DFA_L1 |

* Il y a 3 états : **S₀**, **S₁**, **S₂**
* L'état initial est **S₀**
* L'état final est **S₂** (reconnaissable par sa bordure intérieure)
* Les transitions sont
  - De **S₀** à **S₁** via `a`
  - De **S₁** à **S₂** via `b`

###### Traitement de l'entrée : `ab`
* Départ de **S₀**
* Transition vers **S₁** via `a`
* Transition vers **S₂** via `b`

Si le DFA atteint **S₂** après avoir analysé toute la chaîne, cela signifie qu'il a reconnu la séquence de symboles.

### Automates Finis Non Déterministes
Un **automate fini non déterministe**, ou **NFA** (pour **Non-deterministic Finite Automaton**), contrairement aux DFA, peut avoir plusieurs transitions pour un même symbole depuis un état donné. Cette caractéristique lui offre une flexibilité accrue sur le plan théorique, mais souvent peu adaptée à une implémentation concrète.

##### Caractéristiques d'un NFA
* **Plusieurs états possibles pour un symbole** : Un NFA peut transiter vers plusieurs états via un même un symbole depuis un état spécifique.
* **Transitions epsilon (ε)** : Les NFA peuvent avoir des transitions `ε`, qui ne nécessitent aucun symbole. Ces transitions permettent à l'automate de changer d'état sans préciser de symbole. On distingue parfois les NFA sans transitions `ε` (simplement appelés **NFA**) de ceux avec transitions `ε` (**NFA-ε**).

#### Exemples de NFA

##### 1. NFA reconnaissant L1 = { aⁿb | n ≥ 1 }.
Expression régulière : `a+b`

Représentation graphique :

![Représentation du NFA pour L1](./1-nfa.png)
* L'automate est composé de 3 états : **S₀**, **S₁**, et **S₂**.
* L'état initial est **S₀**.
* L'état final est **S₂**.
* Les transitions sont :
  * De **S₀** à **S₀** via `a`
  * De **S₀** à **S₁** via `a`
  * De S₁ à **S₂** via `b`

##### 2. NFA-ε reconnaissant L2 = { aⁿb | n ≥ 0 }.
Expression régulière : `a*b`

Représentation graphique :

![Représentation du NFA-ε pour L2](./1-nfa-epsilon.png)

* L'automate est composé de 3 états : **S₀**, **S₁**, et **S₂**.
* L'état initial est **S₀**.
* L'état final est **S₂**.
* Les transitions sont :
  * De **S₀** à **S₀** via `a`
  * De **S₀** à **S₁** via `a`
  * De **S₀** à **S₁** via `ε`
  * De **S₁** à **S₂** via `b`

###### Traitement de l'entrée : `b`
* Départ de **S₀**
* Transition vers **S₁** via `ε`
* Transition vers **S₂** via `b`

En plus de l'entrée `b`, **L2** accepte toutes les mots de **L1**.

### Conversion de NFA en DFA
Du fait de leur nature non-déterministe, les NFA sont généralement complexes à implémenter. C'est pour ça qu'il sont souvent [convertis en DFA](https://www.youtube.com/watch?v=jMxuL4Xzi_A).

## Conclusion
Il faut donc bien comprendre qu'un langage régulier est un langage formel pouvant être reconnu par un automate fini, et pouvant être décrit par une expression régulière.

Nous sommes très loin d'avoir abordé toutes les notions de la théorie des langages, nous en reparlerons un peu lorsque nous nous intéresserons à l'analyse syntaxique. Je pars du principe que beaucoup de lecteurs n'ont pas les bases mathématiques nécessaires ni d'intérêt pour le sujet, mais vous pouvez consulter les ressources présentes dans la section **Aller plus loin**.

---

[Passer au chapitre suivant](https://github.com/jean-michelet/create-programming-language-ts/blob/main/fr/1/lexical-analysis-implementation.md)

## Aller plus loin
- Porter, Harry. (2015). Youtube. [Lecture 1/65: Background: What You Probably Know.](https://www.youtube.com/watch?v=TOsMcgIK95k) (Remise à niveau mathématique)
- Demaille, Akim. (21 novembre 2016). Youtube. [Théorie des Langages.](https://www.youtube.com/watch?v=WbUpN4fHs_k)
- Solnon, Christine. PDF. [Théorie des Langages.](https://perso.liris.cnrs.fr/christine.solnon/langages.pdf)
- Sipser, Michael. (2012). Introduction to the Theory of Computation.

## Crédits
- Les illustrations d'automate présentes dans ce cours ont été générées sur le site [https://madebyevan.com/fsm/](https://madebyevan.com/fsm/)
