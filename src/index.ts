import { getSoLiDSession } from './solidAuth';

function putFile(content: string, session: any) {}

(async function main() {
  const session = await getSoLiDSession();
  const publicFolder = session.webId.replace('profile/card#me', 'public');
  console.log(`${publicFolder}/zhihu/aa.txt`);

  await session.fetch(`${publicFolder}/zhihu/aa.txt`, {
    method: 'PUT',
    headers: { 'Content-Type': 'text', origin: session.webId, cookie: 'nssidp.sid=s%3AtDGDfwwArX4hSoa5L5tVh4YPV9hHjF4D.y%2FSka9fedhN7JGUnrZ8aKN9PzsfZH9gRzCe5fFdWOdw' },
    body: 'asdf',
  });
})();

const QUESTIONS_INFO_URL =
  'https://www.zhihu.com/api/v4/questions/{}?include=data[*].answer_count,follower_count,content,detail';
const ANSWER_INFO_URL = `https://www.zhihu.com/api/v4/questions/{}/answers?include=data[*].is_normal,reward_info,
            is_collapsed,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,
            comment_permission,mark_infos,created_time,updated_time,review_info,title,id,created,
            updated_time,is_recognized&offset={}&limit=20&sort_by=default`;
