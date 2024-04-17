"""Modifying username, email and password columns from user

Revision ID: a2d530a3fd29
Revises: dc7c93533eec
Create Date: 2024-04-16 23:01:18.880317

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2d530a3fd29'
down_revision: Union[str, None] = 'dc7c93533eec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('users', 'username',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.String(length=50),
               existing_nullable=False)
    op.alter_column('users', 'email',
               existing_type=sa.VARCHAR(length=40),
               type_=sa.String(length=60),
               existing_nullable=False)
    op.alter_column('users', 'password',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.String(length=100),
               existing_nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('users', 'password',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)
    op.alter_column('users', 'email',
               existing_type=sa.String(length=60),
               type_=sa.VARCHAR(length=40),
               existing_nullable=False)
    op.alter_column('users', 'username',
               existing_type=sa.String(length=50),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False)
    # ### end Alembic commands ###