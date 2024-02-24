require('dotenv').config()
module.exports = {
  development: {
    client: "pg",
    connection: {
      host: "127.0.0.1",
      port: 5436,
      database: "click_camisetas",
      user: "admin123",
      password: "dmn102030",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "pg",
    connection: {
      host: process.env.SUPABASE_HOST,
      port: process.env.SUPABASE_PORT,
      database: process.env.SUPABASE_DB,
      user: process.env.SUPABASE_USERNAME,
      password: process.env.SUPABASE_PWD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
