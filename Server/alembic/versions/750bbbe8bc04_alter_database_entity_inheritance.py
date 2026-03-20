"""Alter database entity inheritance.

Revision ID: 750bbbe8bc04
Revises: 4d3a3d8dcb2e
Create Date: 2026-03-14 23:53:49.591374

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.database.entry import engine
from sqlalchemy.dialects.postgresql import JSONB
from app.shared.enums import AppointmentStatus, Mode, Status, UserRole, UserRoleV2


# revision identifiers, used by Alembic.
revision: str = '750bbbe8bc04'
down_revision: Union[str, Sequence[str], None] = '4d3a3d8dcb2e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_drop_cols = ["preferences", "messages", "contact"]
appointment_drop_cols = ["doctor_id", "clinic_id", "schedule_id"]


def upgrade() -> None:
    """Upgrade schema."""
    for col in user_drop_cols:
        op.drop_column("user", col)

    op.add_column("user", sa.Column("name", sa.String, nullable=True))

    op.drop_constraint(constraint_name="doctor_clinics_doctor_id_fkey",
                       table_name="doctor_clinics", type_="foreignkey")

    op.drop_column("doctor", "currently_available")
    op.alter_column("doctor", column_name="status", type_=sa.Enum(Status, native_enum=False),
                    server_default="'UNKNOWN'", default=Status.UNKNOWN)
    op.alter_column("doctor", "rating", type_=sa.DECIMAL(2, 1))

    op.drop_constraint(constraint_name="doctor_clinics_clinic_id_fkey",
                       table_name="doctor_clinics", type_="foreignkey")

    op.alter_column("clinic", "name", nullable=False)
    op.drop_column("clinic", "owner_name")
    op.add_column("clinic", sa.Column(
        "owner", sa.UUID(as_uuid=True), sa.ForeignKey("user.id"), index=True))

    op.alter_column("clinic", "rating", type_=sa.DECIMAL(2, 1))
    op.drop_column("clinic", "address")

    op.add_column("clinic", sa.Column("location", sa.VARCHAR))
    op.add_column("clinic", sa.Column(name="contact_numbers",
                  type_=sa.ARRAY(sa.String(10)), server_default="{}"))

    for col in ["specializations", "facilities"]:
        op.alter_column("clinic", column_name=col, type_=sa.JSON)

    op.alter_column("schedule", column_name="weekdays", type_=sa.JSON)
    op.alter_column("slot", column_name="begin",
                    type_=sa.Time(timezone=True))

    op.execute("DROP TYPE consultation_mode CASCADE",)
    op.alter_column("slot", column_name="mode", type_=sa.Enum(
        Mode, native_enum=False), server_default="'IN_PERSON'")

    op.execute("DROP TYPE user_role CASCADE")
    op.drop_column("user", "role")
    op.add_column("user", sa.Column("role", type_=sa.Enum(
        enums=UserRoleV2, native_enum=False), server_default="NA"))

    op.create_check_constraint(constraint_name="chk_for_valid_userrole", table_name="user",
                               condition="role IN ('PATIENT', 'CLINIC_ADMIN', 'DOCTOR', 'NA')")

    op.execute("DROP TYPE doctor_availability_status CASCADE")
    op.execute("DROP TYPE IF EXISTS status CASCADE")

    op.alter_column("doctor", column_name="status", type_=sa.Enum(
        Status, native_enum=False), server_default="UNKNOWN")

    op.rename_table(old_table_name="appointments",
                    new_table_name="appointment")

    for col in appointment_drop_cols:
        op.drop_column("appointment", col)

    op.execute("DROP TYPE appointment_status CASCADE")
    op.drop_column("appointment", "status")
    op.add_column("appointment", sa.Column("status", type_=sa.Enum(
        AppointmentStatus, native_enum=False), server_default="ACTIVE"))

    op.drop_constraint("chk_patient_identity", "appointment")
    op.create_check_constraint(constraint_name="chk_for_patient_identity", table_name="appointment",
                               condition="(patient_id IS NOT NULL) or (guest_name IS NOT NULL)")

    op.drop_constraint("chk_doctor_rating", "doctor")
    op.drop_constraint("chk_clinic_rating", "clinic")

    op.create_check_constraint(constraint_name="chk_for_doctor_rating", table_name="doctor",
                               condition="rating >= 0 and rating <= 5.0")
    op.create_check_constraint(constraint_name="chk_for_clinic_rating", table_name="clinic",
                               condition="rating >= 0 and rating <= 5.0")

    op.drop_constraint(constraint_name="chk_schedule_timing",
                       table_name="schedule")
    op.create_check_constraint(constraint_name="chk_for_valid_schedule_timing", table_name="schedule",
                               condition="start_time < end_time")

    op.create_foreign_key(constraint_name="doctor_clinics_doctor_id_fkey", source_table="doctor_clinics",
                          referent_table="doctor", local_cols=["doctor_id"], remote_cols=["id"])

    op.create_foreign_key("doctor_clinics_clinic_id_fkey",
                          "doctor_clinics", "clinic", ["clinic_id"], ["id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("user", sa.Column(name="preferences", type_=sa.JSON))
    op.add_column("user", sa.Column(name="messages", type_=sa.JSON))
    op.add_column("user", sa.Column(
        name="contact", type_=sa.String(length=10)))

    op.drop_column("user", "name")

    op.add_column("doctor", sa.Column(
        "currently_available", sa.Boolean, default=True))

    op.alter_column("doctor", column_name="status",
                    type_=sa.Enum(Status, native_enum=False))
    op.alter_column("doctor", "rating", type_=sa.DECIMAL(2))

    op.alter_column("clinic", "name", nullable=True)

    op.add_column("clinic", sa.Column("owner_name", sa.String, nullable=True))
    op.drop_column("clinic", "owner")

    op.alter_column("clinic", "rating", type_=sa.DECIMAL(2))

    op.add_column("clinic", sa.Column("address", sa.String))
    op.drop_column("clinic", "location")

    op.drop_column("clinic", "contact_numbers")

    for col in ["specializations", "facilities"]:
        op.alter_column("clinic", column_name=col, type_=JSONB)

    op.alter_column("schedule", column_name="weekdays", type_=JSONB)
    op.alter_column("slot", column_name="begin", type_=sa.Time(timezone=True))

    op.alter_column("slot", column_name="mode",
                    type_=sa.Enum(Mode, native_enum=False))

    op.alter_column("user", column_name="role",
                    type_=sa.Enum(UserRole, native_enum=False))
    op.alter_column("doctor", column_name="status",
                    type_=sa.Enum(Status, native_enum=False))

    op.rename_table(old_table_name="appointment",
                    new_table_name="appointments")

    for col in appointment_drop_cols:
        op.add_column("appointments", column=sa.Column(
            name=col, type_=sa.UUID))

    op.alter_column("appointments", "status", type_=sa.Enum(
        AppointmentStatus, native_enum=False), server_default="'ACTIVE'")

    op.drop_constraint("chk_for_patient_identity", "appointments")
    op.create_check_constraint(constraint_name="chk_patient_identity", table_name="appointments",
                               condition="(patient_id IS NOT NULL) or (guest_name IS NOT NULL)")

    op.drop_constraint("chk_for_doctor_rating", "doctor")
    op.drop_constraint("chk_for_clinic_rating", "clinic")

    op.create_check_constraint(constraint_name="chk_doctor_rating", table_name="doctor",
                               condition="rating >= 0 and rating <= 5.0")
    op.create_check_constraint(constraint_name="chk_clinic_rating", table_name="clinic",
                               condition="rating >= 0 and rating <= 5.0")

    op.drop_constraint(
        constraint_name="chk_for_valid_schedule_timing", table_name="schedule")
    op.create_check_constraint(constraint_name="chk_schedule_timing", table_name="schedule",
                               condition="start_time < end_time")
