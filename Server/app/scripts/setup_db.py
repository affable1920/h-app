import sqlalchemy as sa

from app.database.entry import engine
from app.shared.enums import AppointmentStatus, Status, UserRole, Mode


def vals(x):
    return [e.value for e in x]


enums = [
    sa.Enum(UserRole, name="userrole"),
    sa.Enum(Mode, name="consultationmode"),
    sa.Enum(AppointmentStatus, name="appointmentstatus"),
    sa.Enum(Status, name="status"),
]


def create_enums():
    with engine.connect() as conn:
        for enum in enums:
            enum.create(conn, checkfirst=True)
        conn.commit()


if __name__ == "__main__":
    create_enums()
