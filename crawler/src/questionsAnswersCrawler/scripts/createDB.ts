import knex from 'knex';
import path from 'path';

import { getTransaction } from '../storage';

(async function() {
  const { db, trx } = await getTransaction();

  trx.schema
    .createTableIfNotExists('users', function(table) {
      table.increments('id');
      table.text('username').unique();
      table.text('nickname');
      // 自我介绍
      table.text('headline');
      table.enu('gender', ['male', 'female', 'unknown']);
    })
    .createTableIfNotExists('answers', function(table) {
      table.increments('_id');
      table.bigInteger('id').unique();
      table.text('content');
      table
        .integer('user')
        .unsigned()
        .references('users.id');
      table
        .integer('question')
        .unsigned()
        .references('questions.id');
      table.integer('createdTime');
      table.integer('updatedTime');
      table.integer('crawledTime');
      table.integer('commentCount');
      table.integer('voteUpCount');
    })
    .createTableIfNotExists('questions', function(table) {
      table.increments('_id');
      table.bigInteger('id').unique();
      table.text('title');
      table.integer('crawledTime');
      table.integer('updatedTime');
    })
    .createTableIfNotExists('failures', function(table) {
      table.increments('id');
      table.text('error');
      table.integer('time');
      table.text('url');
    })
    .then(() =>
    trx('users').insert({
        gender: 'unknown',
        headline: '',
        nickname: '匿名用户',
        username: '',
      })
    )
    .then(() => trx.commit())
    .then(() => db.destroy())
    .catch(function(e) {
      console.error(e);
    });
})();
