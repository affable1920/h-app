"""Alter table 'Review' - allow polymorphic associations.

Revision ID: 3269a9ef332a
Revises: e291aefc63ab
Create Date: 2026-05-31 22:58:01.813349

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.schemas.enums import ReviewableEntity
from app.database.entry import engine

# revision identifiers, used by Alembic.
revision: str = '3269a9ef332a'
down_revision: Union[str, Sequence[str], None] = 'e291aefc63ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with engine.connect() as conn:
        sa.Enum(ReviewableEntity, name="reviewable_entity").create(conn)
        conn.commit()

    op.drop_column('review', 'doctor_id')
    op.drop_column('review', 'clinic_id')

    op.alter_column("review", "appointment_id", nullable=True)

    op.add_column("review", sa.Column("entity", sa.Enum(
        ReviewableEntity, name="reviewable_entity"), nullable=False))
    op.add_column("review", sa.Column("entity_id", sa.UUID, nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    pass
