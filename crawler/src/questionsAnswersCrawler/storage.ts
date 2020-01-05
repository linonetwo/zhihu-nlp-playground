import knex from 'knex';
import path from 'path';

import { IAnswerData } from './responses';
import { parseGenderFromZhihuGenderID, getCurrentTime } from './utils';

export async function getTransaction() {
  const db = knex({
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../../../data/questionsAnswers.sqlite'),
    },
    useNullAsDefault: true,
  });
  const trx = await db.transaction();
  return { trx, db };
}

export async function saveAnswerToDB(questionID: number, answer: IAnswerData, trx: knex.Transaction<any, any>) {
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
  try {
    // 如果没有爬取过这个用户，就在数据库里记录一下这个用户的基本信息，匿名用户直接用 1，已经预存在数据库里了
    let authorIDinDB: number = 1;
    if (username !== '') {
      let userIDResult: { id: number } | undefined = await trx('users')
        .where({
          username,
        })
        .first('id');
      if (!userIDResult) {
        authorIDinDB = (
          await trx('users').insert({
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
    const existedAnswer: { updatedTime: number } | undefined = await trx('answers')
      .where({ id: answerID })
      .first('updatedTime');
    // 如果这个问题之前爬过了
    if (existedAnswer !== undefined) {
      await trx('answers')
        .where({ id: answerID })
        .update({
          content,
          updatedTime,
          crawledTime: getCurrentTime(),
          commentCount,
          voteUpCount,
        });
    } else {
      await trx('answers').insert({
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
    console.error(error);
    await trx('failures').insert({
      url: `https://www.zhihu.com/question/${questionID}/answer/${answerID}`,
      error: String(error),
      time: getCurrentTime(),
    });
  }
}
