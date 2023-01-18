index.md - v2.0.0 / [Exports](modules.md)

<div style="text-align: center;" align="center">

# reinstaller

A simple installing tool

[![NPM version][npm-image]][npm-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]
[![License][license-image]][license-url]

[![Sonar][sonar-image]][sonar-url]

</div>

<div style="text-align: center; margin-bottom: 20px;" align="center">

## **Full API docs： [API Docs](./docs/modules.md)**

</div>

## Installing

```bash{2,4}
# use pnpm
$ pnpm install -g reinstaller

# use npm
$ npm install -g reinstaller

# use yarn
$ yarn global add reinstaller
```

## Usage

```bash
reinstaller .
# or
reinstaller webapp/app
```

## Configuration

Use `.reinstallerrc` file

### `packageTags`: Specify the tags to be installed

```json
{
  "packageTags": {
    "vue": "next",
    "js-cool": "^2.8.0"
  }
}
```

### `exclude`: Exclude packages that you don't want to install

```json
{
  "exclude": ["tsnd"]
}
```

### `registry`: Set registry

```json
{
  "registry": "https://registry.npmmirror.com"
}
```

## Support & Issues

Please open an issue [here](https://github.com/saqqdy/reinstaller/issues).

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/reinstaller.svg?style=flat-square
[npm-url]: https://npmjs.org/package/reinstaller
[codacy-image]: https://app.codacy.com/project/badge/Grade/f70d4880e4ad4f40aa970eb9ee9d0696
[codacy-url]: https://www.codacy.com/gh/saqqdy/reinstaller/dashboard?utm_source=github.com&utm_medium=referral&utm_content=saqqdy/reinstaller&utm_campaign=Badge_Grade
[codecov-image]: https://img.shields.io/codecov/c/github/saqqdy/reinstaller.svg?style=flat-square
[codecov-url]: https://codecov.io/github/saqqdy/reinstaller?branch=master
[download-image]: https://img.shields.io/npm/dm/reinstaller.svg?style=flat-square
[download-url]: https://npmjs.org/package/reinstaller
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE
[sonar-image]: https://sonarcloud.io/api/project_badges/quality_gate?project=saqqdy_reinstaller
[sonar-url]: https://sonarcloud.io/dashboard?id=saqqdy_reinstaller
