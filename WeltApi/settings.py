from envparse import Env

env=Env()

DB_HOST = env.str(
    "DB_HOST",
    default="db:5432"
)

REAL_DATABASE_URL = env.str(
    "REAL_DATABASE_URL",
    default=f"postgresql+asyncpg://postgres:postgres@db:5432/postgres"
)

BASE_URL = env.str(
    "BASE_URL",
    default="http://176.124.212.130:8000"
)


ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
ALGORITHM = "HS256"
JWT_SECRET_KEY = env.str('JWT_SECRET_KEY', default='49b23e9824c806747eca0217ed33a5b0327031cd4399db5805bed4e8ee5f7254619c3e08b21ae5cb93ef5313b02a6f5abf8a9298c205148337c9f3276f035200')
JWT_REFRESH_SECRET_KEY = env.str('JWT_REFRESH_SECRET_KEY', default='49b23e9824c806747eca0217ed33a5b0327031cd4399db5805bed4e8ee5f7254619c3e08b21ae5cb93ef5313b02a6f5abf8a9298c205148337c9f3276f035200')



