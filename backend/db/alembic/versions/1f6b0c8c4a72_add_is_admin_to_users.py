"""add is_admin to users

Revision ID: 1f6b0c8c4a72
Revises: b7d9d8e34f11
Create Date: 2026-03-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1f6b0c8c4a72'
down_revision: Union[str, Sequence[str], None] = 'b7d9d8e34f11'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column['name'] for column in inspector.get_columns('users')}

    if 'is_admin' not in user_columns:
        op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column['name'] for column in inspector.get_columns('users')}

    if 'is_admin' in user_columns:
        op.drop_column('users', 'is_admin')
