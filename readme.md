![Capitana: a build tool for microservices](cover.png)

[![install size](https://flat.badgen.net/packagephobia/install/capitana)](https://packagephobia.now.sh/result?p=capitana) [![npm version](https://flat.badgen.net/npm/v/capitana)](https://www.npmjs.com/package/capitana) [![XO code style](https://flat.badgen.net/xo/status/capitana)](https://github.com/xojs/xo)

Microservice architecture has its perks, and orchestration systems sure do help to alleviate its pitfalls. Sooner or later, though, developers end up with a bunch of scripts to manage all the steps required to deploy your architecture.

With `capitana`, you'll be able to control all the things your orchestration system can't quite reach.

Forget about

```bash
./build-database-prod.sh
./build-api-prod.sh
./build-database-prod.sh
```

and start `capitana build --environment prod --all`!

## Installation

### Using [npm](https://github.com/npm/cli)

```bash
$ npm install --global capitana
```

### Using [npx](https://github.com/zkat/npx)

```bash
$ npx capitana [stage] [microservices] [options]
```

## Usage

```bash
$ capitana --help

    Usage
      capitana [stage] [microservices] [options]

    Options
      --all  Execute program on all microservices.
      --break Stop execution on execution failure.
      --config filePath Specifies a different config file to use
      --except  Exclude [microservices] microservices from execution.
      --full  Executes all stages on the selected microservices.
      --help  Show this message and exit.
      --interactive Executes capitana interactively.
      --list [variables|microservices|stages] List configured variables.
      --listAllowed microservice Lists the stages the microservice is allowed to run through.
      --no-warnings Treats all stderr as an error and not a warning.
      --verbose  Execute program on all microservices.
    Examples
    $ capitana deploy --all
      executes stage 'deploy' on all microservices
    $ capitana --full database
      executes all stages on microservice 'database'
```

## Configuration file

Capitana is heavily dependant on its own `.capitanarc` configuration file. For the time being, the only way to mahe `capinana` respect this configuration file is to create it on the folder you're gonna be running `capitana` on.

Example configuration file:

```yaml
microservices:
  database: ~
  load-balancer:
    allowedStages:
      - tag
      - deploy
  server: ~
stages:
  build:
    run: npm run build
    cwd: $MICROSERVICE
  deploy:
    run: kubernetes apply -f deployment-$environment-$tag.yaml
    variables:
      - environment
      - tag
    cwd: $MICROSERVICE
  push:
    run: docker-compose push
    cwd: $MICROSERVICE
variables:
  environment:
    - dev
    - test
    - prod
  tag:
    - latest
    - "1.0"
  defaults:
    tag: "latest"
```

## License

MIT © [LTS Beratung](https://lts-beratung.de/en.html)
