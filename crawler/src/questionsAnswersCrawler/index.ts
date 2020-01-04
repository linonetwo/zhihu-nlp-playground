import { parseGenderFromZhihuGenderID, getCurrentTime } from './utils';
import { getAnswersNewerThanTime } from './fetcher';
import { saveAnswerToDB, getTransaction } from './storage';

async function crawling() {
  const { trx, db } = await getTransaction();
  const questions = await trx
    .column('id', 'crawledTime')
    .select()
    .from('questions');

  for (const question of questions) {
    const { id, crawledTime } = question;
    for await (const answer of getAnswersNewerThanTime(id, crawledTime)) {
      // 先检查有没有出错
      if ('error' in answer) {
        await trx('failures').insert(answer);
      } else {
        await saveAnswerToDB(id, answer, trx);
      }
    }

    await trx('questions')
      .where({ id })
      .update({ crawledTime: getCurrentTime() });
  }
  await trx.commit();
  await db.destroy();
}

async function resumeFailure() {
  const { trx, db } = await getTransaction();
  const questionID = 275359100;
  for await (const answer of getAnswersNewerThanTime(questionID, 0, 30360)) {
    // 先检查有没有出错
    if ('error' in answer) {
      await trx('failures').insert(answer);
    } else {
      await saveAnswerToDB(questionID, answer, trx);
    }
  }

  await trx('questions')
    .where({ id: questionID })
    .update({ crawledTime: getCurrentTime() });
  await trx.commit();
  await db.destroy();
}

// crawling();
resumeFailure();
