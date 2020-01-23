import Promise from 'bluebird';
import nodeFetch from 'node-fetch';
import fetchRetry from '@zeit/fetch-retry';

import { IAnswerData, IQuestionAnswersResponse } from './responses';

import { getCurrentTime } from './utils';

const fetch: typeof nodeFetch = fetchRetry(nodeFetch);

export interface ICrawlFailure {
  url: string;
  error: string;
  time: number;
}

export async function* getAnswersNewerThanTime(
  questionID: number,
  crawledTime: number,
  previousOffset: number = 0
): AsyncGenerator<IAnswerData | ICrawlFailure, void, unknown> {
  const batchSize = 20;
  let hasNewContent = true;
  let currentOffset = previousOffset;
  while (hasNewContent) {
    // 如果接下来没有置为 true，则爬完这一页就不爬了
    hasNewContent = false;
    const ANSWER_INFO_URL = `https://www.zhihu.com/api/v4/questions/${questionID}/answers?include=data[*].comment_count,content,voteup_count,created_time,updated_time,title,id,created,updated_time&offset=${currentOffset}&limit=${batchSize}&sort_by=updated`;

    try {
      await Promise.delay(Math.random() * 100);
      console.info(
        `Downloading https://www.zhihu.com/question/${questionID} offset=${currentOffset}&limit=${batchSize}`
      );
      const result: IQuestionAnswersResponse = await fetch(ANSWER_INFO_URL).then(res => res.json());
      if (!('data' in result)) {
        console.log(result);
        throw new Error(`${currentOffset}`);
      }
      for (const answer of result.data) {
        const newerThanCrawledVersion = answer.updated_time > crawledTime;
        if (newerThanCrawledVersion) {
          hasNewContent = true;
          yield answer;
        }
      }

      // 下一轮的参数
      currentOffset += batchSize;
      if (result.paging.is_end === true) {
        hasNewContent = false;
      }
    } catch (error) {
      console.error(error);
      yield {
        url: ANSWER_INFO_URL,
        error: JSON.stringify(error),
        time: getCurrentTime(),
      };
    }
  }
}
