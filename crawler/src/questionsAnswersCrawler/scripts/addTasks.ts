import knex from 'knex';
import path from 'path';
import nodeFetch from 'node-fetch';
import fetchRetry from '@zeit/fetch-retry';

import { getCurrentTime } from '../utils';
import { getTransaction } from '../storage';

const fetch: typeof nodeFetch = fetchRetry(nodeFetch);

(async function() {
  const { trx, db } = await getTransaction();

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
    60073231,
    280523155,
  ];

  await Promise.all(
    questionIDs.map(async id => {
      const QUESTIONS_INFO_URL = `https://www.zhihu.com/api/v4/questions/${id}?include=data[*].answer_count,follower_count,content,detail`;
      const result = await fetch(QUESTIONS_INFO_URL).then(res => res.json());
      console.warn(`result`, JSON.stringify(result, null, '  '));
      try {
        const existedQuestion: { id: number; updatedTime: number; crawledTime: number } | undefined = await trx(
          'questions'
        )
          .where({
            id,
          })
          .first('id', 'updatedTime', 'crawledTime');
        if (existedQuestion === undefined) {
          await trx('questions').insert({
            id: result.id,
            title: result.title,
            // 这个是问题详情的更新时间，不是里面回答的更新时间
            updatedTime: result.updated_time,
            // 还没爬过，用于比较的时间设为最小值
            crawledTime: 0,
          });
        } else if (result.updated_time > existedQuestion.updatedTime) {
          await trx('questions')
            .where({
              id,
            })
            .update({
              title: result.title,
              updatedTime: result.updated_time,
            });
        }
      } catch (error) {
        console.error(error);
      }
    })
  );
  await trx.commit();
  await db.destroy();
})();
