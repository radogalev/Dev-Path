"""add email verification to users

Revision ID: add_verification_fields
Revises: 1f6b0c8c4a72
Create Date: 2026-03-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_verification_fields'
down_revision: Union[str, Sequence[str], None] = '1f6b0c8c4a72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column['name'] for column in inspector.get_columns('users')}

    if 'is_verified' not in user_columns:
        op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    
    if 'verification_token' not in user_columns:
        op.add_column('users', sa.Column('verification_token', sa.String(255), nullable=True, unique=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column['name'] for column in inspector.get_columns('users')}

    if 'verification_token' in user_columns:
        op.drop_column('users', 'verification_token')
    
    if 'is_verified' in user_columns:
        op.drop_column('users', 'is_verified')
