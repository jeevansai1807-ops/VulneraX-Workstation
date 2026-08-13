import asyncio
from database import User, async_session
from core.security import get_password_hash
from sqlalchemy import select

async def create_user():
    async with async_session() as session:
        result = await session.execute(select(User).where(User.username == "aryan"))
        user = result.scalars().first()
        hashed_pw = get_password_hash("password123")
        
        if user:
            user.hashed_password = hashed_pw
        else:
            user = User(username="aryan", hashed_password=hashed_pw)
            session.add(user)
            
        await session.commit()
        print("User 'aryan' created/updated with password 'password123'")

if __name__ == "__main__":
    asyncio.run(create_user())
