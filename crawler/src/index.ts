import nodeFetch from 'node-fetch';
import fetchRetry from '@zeit/fetch-retry'
import knex from 'knex';
import path from 'path';
import Promise from 'bluebird';

import { parseGenderFromZhihuGenderID, getCurrentTime } from './utils';

const fetch = fetchRetry(nodeFetch);

async function crawling() {
  const db = knex({
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../../data/data.sqlite'),
    },
    useNullAsDefault: true,
  });

  const questions = await db
    .column('id', 'crawledTime')
    .select()
    .from('questions');

  for (const question of questions) {
    const { id, crawledTime } = question;
    for await (const answer of getAnswersNewerThanTime(id, crawledTime)) {
      // 先检查有没有出错
      if ('error' in answer) {
        await db('failures').insert(answer);
        continue;
      }
      saveAnswerToDB(id, answer, db);
    }

    await db('questions')
      .where({ id })
      .update({ crawledTime: getCurrentTime() });
  }

  await db.destroy();
}

interface IQuestionAnswersResponse {
  data: IAnswerData[];
  paging: IPaging;
}

interface IAuthor {
  // URL 里的用户名
  url_token: string;
  // 昵称，若 url_token 为空，这里就会是「匿名用户」
  name: string;
  // 自我介绍
  headline: string;
  gender: number;
}
interface IPaging {
  is_end: boolean;
  is_start: boolean;
  next: string;
  previous: string;
  totals: number;
}
interface IAnswerData {
  id: number;
  author: IAuthor;
  created_time: number;
  updated_time: number;
  voteup_count: number;
  comment_count: number;
  content: string;
}

interface ICrawlFailure {
  url: string;
  error: string;
  time: number;
}
async function* getAnswersNewerThanTime(
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
      await Promise.delay(Math.random() * 1000);
      console.info(
        `Downloading https://www.zhihu.com/question/${questionID} offset=${currentOffset}&limit=${batchSize}`
      );
      const result: IQuestionAnswersResponse = await fetch(ANSWER_INFO_URL).then((res: Response) => res.json());
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

async function saveAnswerToDB(questionID: number, answer: IAnswerData, db: knex<any, unknown[]>) {
  // 格式化爬取的数据，方便存入数据库
  const {
    id: answerID,
    content,
    author: { gender: genderFlag, headline, name: nickname, url_token: username },
    created_time: createdTime,
    updated_time: updatedTime,
    comment_count: commentCount,
    voteup_count: voteUpCount,
  } = answer;
  const gender = parseGenderFromZhihuGenderID(genderFlag, username);
  // 如果没有爬取过这个用户，就在数据库里记录一下这个用户的基本信息，匿名用户直接用 1，已经预存在数据库里了
  let authorIDinDB: number = 1;
  if (username !== '') {
    let userIDResult: { id: number } | undefined = await db('users')
      .where({
        username,
      })
      .first('id');
    if (!userIDResult) {
      authorIDinDB = (
        await db('users').insert({
          gender,
          headline,
          nickname,
          username,
        })
      )[0];
    } else {
      authorIDinDB = userIDResult.id;
    }
  }

  // 把回答存入数据库
  try {
    const existedAnswer: { updatedTime: number } | undefined = await db('answers')
      .where({ id: answerID })
      .first('updatedTime');
    // 如果这个问题之前爬过了
    if (existedAnswer !== undefined) {
      await db('answers')
        .where({ id: answerID })
        .update({
          content,
          updatedTime,
          crawledTime: getCurrentTime(),
          commentCount,
          voteUpCount,
        });
    } else {
      await db('answers').insert({
        id: answerID,
        user: authorIDinDB,
        content,
        createdTime,
        updatedTime,
        crawledTime: getCurrentTime(),
        commentCount,
        voteUpCount,
      });
    }
  } catch (error) {
    await db('failures').insert({
      url: `https://www.zhihu.com/question/${questionID}/answer/${answerID}`,
      error: String(error),
      time: getCurrentTime(),
    });
  }
}

async function resumeFailure() {
  const db = knex({
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../../data/data.sqlite'),
    },
    useNullAsDefault: true,
  });

  const questionID = 275359100;
  for await (const answer of getAnswersNewerThanTime(questionID, 0, 7340)) {
    // 先检查有没有出错
    if ('error' in answer) {
      await db('failures').insert(answer);
      continue;
    }
    saveAnswerToDB(questionID, answer, db);
  }

  await db('questions')
    .where({ id: questionID })
    .update({ crawledTime: getCurrentTime() });

  await db.destroy();
}

// crawling();
resumeFailure();
