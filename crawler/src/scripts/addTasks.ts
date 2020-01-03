import knex from 'knex';
import path from 'path';
import fetch from 'node-fetch';

import { getCurrentTime } from '../utils';

const questionIDs = [
  308798869,
  275359100,
  309872833,
  311464426,
  311091528,
  310738373,
  311783683,
  310390277,
  308696075,
  310213933,
  306158176,
  309197690,
  307840845,
  306927407,
  310260745,
  310012254,
  308773964,
  299892088,
  312340012,
  308770393,
  311932395,
  307831580,
  317630141,
  311316650,
];

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../../data/data.sqlite'),
  },
  useNullAsDefault: true,
});

Promise.all(
  questionIDs.map(async id => {
    const QUESTIONS_INFO_URL = `https://www.zhihu.com/api/v4/questions/${id}?include=data[*].answer_count,follower_count,content,detail`;
    const result = await fetch(QUESTIONS_INFO_URL).then((res: Response) => res.json());
    try {
      await db('questions').insert({
        id: result.id,
        title: result.title,
        updatedTime: result.updated_time,
        crawledTime: getCurrentTime(),
      });
    } catch (error) {
      console.error(error);
    }
  })
).then(() => {
  db.destroy();
});
