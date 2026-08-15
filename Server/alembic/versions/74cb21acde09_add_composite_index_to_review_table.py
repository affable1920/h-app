"""add composite index to review table.

Revision ID: 74cb21acde09
Revises: 3269a9ef332a
Create Date: 2026-08-14 17:45:11.362981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74cb21acde09'
down_revision: Union[str, Sequence[str], None] = '3269a9ef332a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(
        index_name="ix_review_entity_entity_id",
        table_name="review",
        columns=["entity", "entity_id"]
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        index_name="ix_review_entity_entity_id",
        table_name="review",
        columns=["entity", "entity_id"]
    )
