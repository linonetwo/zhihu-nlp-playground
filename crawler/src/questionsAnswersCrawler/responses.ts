export interface IQuestionAnswersResponse {
  data: IAnswerData[];
  paging: IPaging;
  error: any;
}

export interface IAuthor {
  // URL 里的用户名
  url_token: string;
  // 昵称，若 url_token 为空，这里就会是「匿名用户」
  name: string;
  // 自我介绍
  headline: string;
  gender: number;
}
export interface IPaging {
  is_end: boolean;
  is_start: boolean;
  next: string;
  previous: string;
  totals: number;
}
export interface IAnswerData {
  id: number;
  author: IAuthor;
  created_time: number;
  updated_time: number;
  voteup_count: number;
  comment_count: number;
  content: string;
}
