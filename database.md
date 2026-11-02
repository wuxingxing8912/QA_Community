# 问答社区数据库设计

## 用户表（users）
- id、username、email、password、avatar
- points：积分
- create_at

## 问题表（question）
- id、title、content（Markdown）
- tags：标签（JSON数组）
- author_id：提问者ID
- views：浏览次数
- answers_count：回答数
- votes：点赞数
- is_solved：是否已解决
- create_at、updated_at

## 回答表（answers）
- id、content（Markdown）
- question_id：问题ID
- author_id：回答者ID
- votes：点赞数
- is_accepted：是否被采纳
- create_at、updated_at

## 点赞表（votes）
- id、user_id、target_type（question/answer）
- target_id：目标ID
- create_at