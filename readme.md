# capitana [![Build Status](https://travis-ci.org/lts-beratung/capitana.svg?branch=master)](https://travis-ci.org/lts-beratung/capitana)

> A minimal, highly customisable microservice deploy helper.


## Install

```
$ npm install capitana
```


## Usage

```js
const capitana = require('capitana');

capitana('unicorns');
//=> 'unicorns & rainbows'
```


## API

### capitana(input, [options])

#### input

Type: `string`

Lorem ipsum.

#### options

Type: `Object`

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.


## CLI

```
$ npm install --global capitana
```

```
$ capitana --help

  Usage
    capitana [input]

  Options
    --foo  Lorem ipsum [Default: false]

  Examples
    $ capitana
    unicorns & rainbows
    $ capitana ponies
    ponies & rainbows
```


## License

MIT © [Victor Enrique Alcazar Lopez](https://lts-beratung.de/en.html)
