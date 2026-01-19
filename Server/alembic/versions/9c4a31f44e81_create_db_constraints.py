"""create db constraints.

Revision ID: 9c4a31f44e81
Revises: 669b429b1cfb
Create Date: 2026-01-13 16:36:54.236257

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9c4a31f44e81"
down_revision: Union[str, Sequence[str], None] = "669b429b1cfb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_unique_constraint(
        "valid_slot_schedule", "slots", ["schedule_id", "begin"]
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        constraint_name="valid_slot_schedule", table_name="patients", type_="check"
    )
