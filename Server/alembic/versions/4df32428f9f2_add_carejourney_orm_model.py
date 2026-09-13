"""Add CareJourney ORM model

Revision ID: 4df32428f9f2
Revises: ead1712eb46b
Create Date: 2026-09-13 22:53:04.355530

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4df32428f9f2'
down_revision: Union[str, Sequence[str], None] = 'ead1712eb46b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "care_journey",
        sa.Column(
            "id",
            sa.UUID,
            primary_key=True,
            server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column(
            "patient_id",
            sa.UUID,
            sa.ForeignKey("patient.id"),
            nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("now()")
        ),
        sa.Column(
            "last_updated",
            sa.DateTime,
            server_default=sa.text("now()"),
            server_onupdate=sa.text("now()")
        )
    )

    op.add_column(
        "appointment",
        sa.Column(
            "care_journey_id",
            sa.UUID,
            sa.ForeignKey("care_journey.id"),
            nullable=True,
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("appointment", "care_journey_id")
    op.drop_table("care_journey")
