# zhihu-nlp-playground

Do some annotation on zhihu dataset.

## Development

## Download DataSet

Run `npm run db:qa:create` to create sqlite db `data/questionsAnswers.sqlite`.

Run `npm run db:qa:addTask` to add crawler task defined in `crawler/src/questionsAnswersCrawler/scripts/addTasks.ts`

Run `npm run run:qa` to crawl all answers from 知乎, which will takes about 5 hours.

### Generate CA and keys first

```shell
npm run generate-keys
```

If you are going to use a different WebID from `zhihucrawler`, replace `zhihucrawler.localhost` in npm script with your preferred one, for example, `linonetwo.localhost`.

### Start local Backend as a Service

`npm run baas-start`
