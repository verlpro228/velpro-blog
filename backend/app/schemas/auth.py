from pydantic import BaseModel, Field


class LoginPayload(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class UserProfile(BaseModel):
    id: str
    name: str
    role: str
    avatar: str
    tagline: str


class ProfileUpdatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    tagline: str = ""


class PasswordUpdatePayload(BaseModel):
    oldPassword: str = Field(min_length=1)
    newPassword: str = Field(min_length=6, max_length=128)
