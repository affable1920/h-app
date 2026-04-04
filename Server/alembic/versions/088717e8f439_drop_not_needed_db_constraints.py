"""drop not needed db constraints.

Revision ID: 088717e8f439
Revises: b33406566246
Create Date: 2026-03-29 15:16:19.636060

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '088717e8f439'
down_revision: Union[str, Sequence[str], None] = 'b33406566246'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(constraint_name="chk_patient_identity",
                       table_name="appointment")


def downgrade() -> None:
    """Downgrade schema."""
    pass
