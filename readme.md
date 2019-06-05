# capitana [![install size](https://flat.badgen.net/packagephobia/install/capitana)](https://packagephobia.now.sh/result?p=capitana) [![XO code style](https://flat.badgen.net/xo/status/capitana)](https://github.com/xojs/xo)

![](example.svg)

Microservice architecture has its perks, and orchestration systems sure do help to alleviate its pitfalls. Sooner or later, though, developers end up with a bunch of scripts to manage all the steps required to deploy your architecture.

With `capitana`, you'll be able to control all the things your orchestration system can't quite reach.

Forget about 

```
./build-database-prod.sh
./build-api-prod.sh
./build-database-prod.sh
``` 

and start `capitana build --environment prod --all`!

## CLI

```
$ npm install --global capitana
```

## Usage

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

## Configuration file

Capitana is heavily dependant on its own `.capitanarc` configuration file. For the time being, the only way to mahe `capinana` respect this configuration file is to create it on the folder you're gonna be running `capitana` on.

Example configuration file:

```
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
```

## License

MIT © [LTS Beratung](https://lts-beratung.de/en.html)
