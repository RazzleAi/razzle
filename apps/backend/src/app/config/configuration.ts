
export default () => ({  
  port: parseInt(process.env.PORT, 10) || 3333,
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  redisCluster: {
    nodes: [
      {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    ],
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
    },
  },
})
