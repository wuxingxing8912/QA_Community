const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'QA Community API',
    version: '1.0.0',
    description: '问答社区后端接口文档（提问 / 回答 / 点赞 / 采纳 / 积分）',
  },
  servers: [{ url: '/api', description: 'API 基础路径' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { message: { type: 'string' } },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        summary: '注册',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', description: '3-20 位字母数字下划线' },
                  email: { type: 'string' },
                  password: { type: 'string', description: '至少 6 位' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '注册成功，返回 token 与 user' },
          400: { description: '参数校验失败', schema: { $ref: '#/components/schemas/Error' } },
          409: { description: '用户名/邮箱已存在', schema: { $ref: '#/components/schemas/Error' } },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: '登录',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', description: '用户名或邮箱' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '登录成功，返回 token 与 user' },
          401: { description: '用户名或密码错误', schema: { $ref: '#/components/schemas/Error' } },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: '获取当前登录用户',
        tags: ['Auth'],
        responses: { 200: { description: '当前用户' } },
      },
    },
    '/users/{id}': {
      get: {
        summary: '获取用户公开资料',
        tags: ['User'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: '用户资料' } },
      },
    },
    '/questions': {
      get: {
        summary: '问题列表',
        tags: ['Question'],
        security: [],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'keyword', in: 'query', schema: { type: 'string' } },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
          { name: 'solved', in: 'query', schema: { type: 'string', enum: ['1', '0'] } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['latest', 'hot'], default: 'latest' } },
        ],
        responses: { 200: { description: '{ list, total, limit, offset }' } },
      },
      post: {
        summary: '发布问题',
        tags: ['Question'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '创建成功，返回 { id }' },
          400: { description: '标题/内容不能为空', schema: { $ref: '#/components/schemas/Error' } },
        },
      },
    },
    '/questions/{id}': {
      get: {
        summary: '问题详情（含回答列表）',
        tags: ['Question'],
        security: [],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: '{ question, answers }' }, 404: { description: '不存在' } },
      },
      put: {
        summary: '编辑问题（仅作者）',
        tags: ['Question'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: { 200: { description: '更新成功' }, 403: { description: '无权限' } },
      },
      delete: {
        summary: '删除问题（仅作者）',
        tags: ['Question'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: '已删除' }, 403: { description: '无权限' } },
      },
    },
    '/answers': {
      post: {
        summary: '回答问题',
        tags: ['Answer'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content', 'question_id'],
                properties: {
                  content: { type: 'string' },
                  question_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { 201: { description: '创建成功，返回 { id }' } },
      },
    },
    '/answers/{id}/accept': {
      put: {
        summary: '采纳答案（仅提问者，每问唯一）',
        tags: ['Answer'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: '已采纳/已取消采纳' },
          403: { description: '只能采纳自己问题的回答' },
        },
      },
    },
    '/votes': {
      post: {
        summary: '点赞 / 取消点赞（toggle，事务保证一致性）',
        tags: ['Vote'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['target_type', 'target_id'],
                properties: {
                  target_type: { type: 'string', enum: ['question', 'answer'] },
                  target_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { 200: { description: '{ voted, votes }' } },
      },
    },
    '/votes/status': {
      get: {
        summary: '查询当前用户是否已点赞',
        tags: ['Vote'],
        parameters: [
          { name: 'target_type', in: 'query', required: true, schema: { type: 'string', enum: ['question', 'answer'] } },
          { name: 'target_id', in: 'query', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: '{ voted }' } },
      },
    },
  },
};

module.exports = swaggerDefinition;
