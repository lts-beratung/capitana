# capitana [![install size](https://flat.badgen.net/packagephobia/install/gineta)](https://packagephobia.now.sh/result?p=gineta) [![XO code style](https://flat.badgen.net/xo/status/standup-boy)](https://github.com/xojs/xo)

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
