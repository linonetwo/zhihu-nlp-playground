import './solidAuth'

const QUESTIONS_INFO_URL =
  'https://www.zhihu.com/api/v4/questions/{}?include=data[*].answer_count,follower_count,content,detail';
const ANSWER_INFO_URL = `https://www.zhihu.com/api/v4/questions/{}/answers?include=data[*].is_normal,reward_info,
            is_collapsed,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,
            comment_permission,mark_infos,created_time,updated_time,review_info,title,id,created,
            updated_time,is_recognized&offset={}&limit=20&sort_by=default`;
