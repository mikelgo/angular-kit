# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [2.1.1](https://github.com/code-workers-io/angular-kit/compare/rx-2.1.0...rx-2.1.1) (2023-04-19)


### Bug Fixes

* **rx:** maintain peer dep to angular-kit/cdk correctly ([afa4e97](https://github.com/code-workers-io/angular-kit/commit/afa4e97c6e616d05af4bbe1cfbda6d37b9c6adef))



# [2.1.0](https://github.com/code-workers-io/angular-kit/compare/rx-2.0.0...rx-2.1.0) (2023-04-17)



# [2.0.0](https://github.com/code-workers-io/angular-kit/compare/rx-1.3.0...rx-2.0.0) (2023-04-17)


### Reverts

* Revert "chore(rx): release version 1.3.1" ([a9a24cc](https://github.com/code-workers-io/angular-kit/commit/a9a24ccc7daafd3e29b77433656901406cc472d9))



# [2.0.0](https://github.com/code-workers-io/angular-kit/compare/rx-1.3.0...rx-2.0.0) (2023-04-17)


### Reverts

* Revert "chore(rx): release version 1.3.1" ([a9a24cc](https://github.com/code-workers-io/angular-kit/commit/a9a24ccc7daafd3e29b77433656901406cc472d9))



# [2.0.0](https://github.com/code-workers-io/angular-kit/compare/rx-1.3.0...rx-2.0.0) (2023-03-29)

### Breaking Changes
* package `signals` was renamed to `streams` and all functions accordingly to not cause confusion with Angular signals.


# [1.3.0](https://github.com/code-workers-io/angular-kit/compare/rx-1.2.2...rx-1.3.0) (2023-03-04)


### Bug Fixes

* **rx:** remove rxModule ([4693530](https://github.com/code-workers-io/angular-kit/commit/46935301d41919829068e6c76b6f5eeac4f55016)), closes [#23](https://github.com/code-workers-io/angular-kit/issues/23)


### Features

* **rx:** add create-effect function ([6836782](https://github.com/code-workers-io/angular-kit/commit/6836782049a59c9ff1ff2b6ef3436b382a4e58ab))
* **rx:** createEffect supports now callback arguments ([ee0e4fa](https://github.com/code-workers-io/angular-kit/commit/ee0e4faee8ebe30912c31f0a6b2b07feb04dcbed))
* **rx:** enhance rxQuery with a configuration object to define if values should be kept on refresh ([fbf2454](https://github.com/code-workers-io/angular-kit/commit/fbf2454307e312668b1747fdf458bff14a83c548)), closes [#20](https://github.com/code-workers-io/angular-kit/issues/20)
* **rx:** improve typing of rxQuery an add generic to type error response ([9ef6b88](https://github.com/code-workers-io/angular-kit/commit/9ef6b88915864dc944722432a1549f623303d37b))
* **rx:** let rxQuery only emit distinct values ([71c7576](https://github.com/code-workers-io/angular-kit/commit/71c75762c344b725befdf2d7bee14c0bd6eba99d))



## [1.2.2](https://github.com/code-workers-io/angular-kit/compare/rx-1.2.1...rx-1.2.2) (2023-02-03)



# [1.2.0](https://github.com/code-workers-io/angular-kit/compare/rx-1.1.0...rx-1.2.0) (2023-01-25)
### Features
* **rx:** increase test coverage for RxRenderInViewPortDirective ([ad99b11](https://github.com/code-workers-io/angular-kit/commit/ad99b11e64397ba817dc16b7775d528fdb1e78ac))


# [1.1.0](https://github.com/code-workers-io/angular-kit/compare/rx-1.0.1...rx-1.1.0) (2023-01-21)


### Features

* **rx:** add creation functions for intersection-, resize-, and mutation observer ([a71a0ff](https://github.com/code-workers-io/angular-kit/commit/a71a0ffa8bf6c77c11bcba9f760f4f2c6784cb5f))
* **rx:** add directive which uses intersection-observer ([49647c6](https://github.com/code-workers-io/angular-kit/commit/49647c6b3b5d20fa99f7bba7dfa7f27a78a0e792))
* **rx:** add directive which uses resize-observer ([4fee038](https://github.com/code-workers-io/angular-kit/commit/4fee03821a0207d9290b17826cd4ada3444c197d))
* **rx:** add flattening operators with default error handling strategies ([63b9328](https://github.com/code-workers-io/angular-kit/commit/63b9328937f80ade4d2bc7ab7110dc053464c211))
* **rx:** add flattening operators with default error handling strategies ([af3af82](https://github.com/code-workers-io/angular-kit/commit/af3af828171561bd7a1f91e495535c30c43fb59e))
* **rx:** add rx-observe-intersection directive ([b767c4e](https://github.com/code-workers-io/angular-kit/commit/b767c4e40cc6d021368e18a9b79eb45d54b6b8af))
* **rx:** add rx-observe-visibility directive ([a832922](https://github.com/code-workers-io/angular-kit/commit/a8329221838054a204b1baaa3777a584b68a75aa))
* **rx:** add rxPluck operator ([9a7213a](https://github.com/code-workers-io/angular-kit/commit/9a7213aa4062cf3c6ce6f76c958c1a2603ca5ec7))
* **rx:** add rxWrap operator ([019debb](https://github.com/code-workers-io/angular-kit/commit/019debb1a5a272e978f812144c3f83cfbe8991c8))
* **rx:** allow passing ElementRef of Element to create-intersection-observer ([df78519](https://github.com/code-workers-io/angular-kit/commit/df785196f6603e12cfc87e03160756bbe5d43346))
* **rx:** allow passing ElementRef of Element to create-mutation-observer ([903807a](https://github.com/code-workers-io/angular-kit/commit/903807ae29f523d915c8153e9af723150937c020))
* **rx:** allow passing ElementRef of Element to create-resize-observer ([c3ea8e4](https://github.com/code-workers-io/angular-kit/commit/c3ea8e4e99ed85969ade51e206631ab762f01788))
* **rx:** create rxRenderInViewPort directive ([86fcf51](https://github.com/code-workers-io/angular-kit/commit/86fcf518f1ff5464e732d73f116bdeefc8a22fdb))
* **rx:** createSignal accepts now a startvalue ([6142513](https://github.com/code-workers-io/angular-kit/commit/6142513918ceb87d4baaefe69e76dd177a3d38c3))
* **rx:** enhance flattening operator with error handling strategies ([224a594](https://github.com/code-workers-io/angular-kit/commit/224a5948e4d5a5dd47274419578c1967b4d5815d))
* **rx:** increase test coverage ([75abc51](https://github.com/code-workers-io/angular-kit/commit/75abc518ef8702014e3f01708c5598d2d306f5e9))



## [1.0.1](https://github.com/code-workers-io/angular-kit/compare/rx-1.0.0...rx-1.0.1) (2023-01-15)



# 1.0.0 (2023-01-15)
