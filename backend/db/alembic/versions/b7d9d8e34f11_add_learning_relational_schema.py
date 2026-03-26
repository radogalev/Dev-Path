"""add learning relational schema

Revision ID: b7d9d8e34f11
Revises: 99a09751f19a
Create Date: 2026-02-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7d9d8e34f11'
down_revision: Union[str, Sequence[str], None] = '99a09751f19a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    tables = set(inspector.get_table_names())

    if 'roadmaps' not in tables:
        op.create_table(
            'roadmaps',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('slug', sa.String(length=100), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('color', sa.String(length=50), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('slug'),
        )

    if 'roadmap_nodes' not in tables:
        op.create_table(
            'roadmap_nodes',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('roadmap_id', sa.Integer(), nullable=False),
            sa.Column('parent_id', sa.Integer(), nullable=True),
            sa.Column('node_type', sa.String(length=30), nullable=False),
            sa.Column('external_id', sa.Integer(), nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('duration', sa.String(length=50), nullable=True),
            sa.Column('lesson_type', sa.String(length=50), nullable=True),
            sa.Column('sort_order', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['parent_id'], ['roadmap_nodes.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['roadmap_id'], ['roadmaps.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('roadmap_id', 'node_type', 'external_id', name='uq_roadmap_node_external'),
        )

    lesson_columns = {column['name'] for column in inspector.get_columns('lessons')}
    if 'roadmap_node_id' not in lesson_columns:
        op.add_column('lessons', sa.Column('roadmap_node_id', sa.Integer(), nullable=True))
    if 'overview' not in lesson_columns:
        op.add_column('lessons', sa.Column('overview', sa.Text(), nullable=True))
    if 'goal' not in lesson_columns:
        op.add_column('lessons', sa.Column('goal', sa.Text(), nullable=True))
    if 'topics_json' not in lesson_columns:
        op.add_column('lessons', sa.Column('topics_json', sa.Text(), nullable=True))
    if 'explanation_json' not in lesson_columns:
        op.add_column('lessons', sa.Column('explanation_json', sa.Text(), nullable=True))
    if 'resources_json' not in lesson_columns:
        op.add_column('lessons', sa.Column('resources_json', sa.Text(), nullable=True))

    lesson_uqs = {constraint['name'] for constraint in inspector.get_unique_constraints('lessons') if constraint.get('name')}
    if 'uq_lessons_roadmap_node_id' not in lesson_uqs:
        op.create_unique_constraint('uq_lessons_roadmap_node_id', 'lessons', ['roadmap_node_id'])

    lesson_fks = {constraint['name'] for constraint in inspector.get_foreign_keys('lessons') if constraint.get('name')}
    if 'fk_lessons_roadmap_node_id' not in lesson_fks:
        op.create_foreign_key(
            'fk_lessons_roadmap_node_id',
            'lessons',
            'roadmap_nodes',
            ['roadmap_node_id'],
            ['id'],
            ondelete='CASCADE',
        )

    task_columns = {column['name'] for column in inspector.get_columns('tasks')}
    if 'lesson_node_id' not in task_columns:
        op.add_column('tasks', sa.Column('lesson_node_id', sa.Integer(), nullable=True))
    if 'assessment_kind' not in task_columns:
        op.add_column('tasks', sa.Column('assessment_kind', sa.String(length=30), nullable=True))
    if 'payload_json' not in task_columns:
        op.add_column('tasks', sa.Column('payload_json', sa.Text(), nullable=True))
    if 'sort_order' not in task_columns:
        op.add_column('tasks', sa.Column('sort_order', sa.Integer(), server_default='1', nullable=False))
    if 'is_required' not in task_columns:
        op.add_column('tasks', sa.Column('is_required', sa.Boolean(), server_default=sa.text('true'), nullable=True))

    task_fks = {constraint['name'] for constraint in inspector.get_foreign_keys('tasks') if constraint.get('name')}
    if 'fk_tasks_lesson_node_id' not in task_fks:
        op.create_foreign_key(
            'fk_tasks_lesson_node_id',
            'tasks',
            'roadmap_nodes',
            ['lesson_node_id'],
            ['id'],
            ondelete='CASCADE',
        )

    task_uqs = {constraint['name'] for constraint in inspector.get_unique_constraints('tasks') if constraint.get('name')}
    if 'uq_task_lesson_kind_order' not in task_uqs:
        op.create_unique_constraint('uq_task_lesson_kind_order', 'tasks', ['lesson_id', 'assessment_kind', 'sort_order'])

    if 'user_lesson_progress' not in tables:
        op.create_table(
            'user_lesson_progress',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('lesson_id', sa.Integer(), nullable=False),
            sa.Column('is_completed', sa.Boolean(), nullable=True),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id', 'lesson_id', name='uq_user_lesson_progress'),
        )


def downgrade() -> None:
    op.drop_table('user_lesson_progress')

    op.drop_constraint('uq_task_lesson_kind_order', 'tasks', type_='unique')
    op.drop_constraint('fk_tasks_lesson_node_id', 'tasks', type_='foreignkey')
    op.drop_column('tasks', 'is_required')
    op.drop_column('tasks', 'sort_order')
    op.drop_column('tasks', 'payload_json')
    op.drop_column('tasks', 'assessment_kind')
    op.drop_column('tasks', 'lesson_node_id')

    op.drop_constraint('fk_lessons_roadmap_node_id', 'lessons', type_='foreignkey')
    op.drop_constraint('uq_lessons_roadmap_node_id', 'lessons', type_='unique')
    op.drop_column('lessons', 'resources_json')
    op.drop_column('lessons', 'explanation_json')
    op.drop_column('lessons', 'topics_json')
    op.drop_column('lessons', 'goal')
    op.drop_column('lessons', 'overview')
    op.drop_column('lessons', 'roadmap_node_id')

    op.drop_table('roadmap_nodes')
    op.drop_table('roadmaps')
