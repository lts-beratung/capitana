# capitana [![Build Status](https://travis-ci.org/lts-beratung/capitana.svg?branch=master)](https://travis-ci.org/lts-beratung/capitana)

> A minimal, highly customisable microservice deploy helper.


## CLI

```
$ npm install --global capitana
```

```
$ capitana --help

  Usage
    capitana [stage] [microservices] [options]

  Options
    --break Stop execution on execution failure.
    --all  Execute program on all microservices.
    --except  Exclude [microservices] microservices from execution.

  Examples
    $ capitana deploy --all
      executes stage 'deploy' on all microservices
```

## License

MIT © [LTS Beratung](https://lts-beratung.de/en.html)
