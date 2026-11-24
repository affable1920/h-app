import asyncio
from datetime import datetime, timedelta, timezone
import logging
import secrets
import sqlalchemy as sa
from uuid import UUID, uuid4
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.entry_async import AsyncSessionLocal
from app.schemas.user import UserResponse
from app.core.exceptions import (
    AlreadyInUseException,
    AuthenticationError,
    ConflictError,
    EntityNotFoundException,
)

from app.database.models import (
    Doctor,
    Patient,
    RefreshToken
)

from app.features.auth import security
from app.schemas.patient import (
    PatientCreate,
    PatientLogin
)

from app.schemas.enums import UserRoleV2
from app.schemas.doctor import DoctorLogin, DrCreate
from app.services.PatientService import PatientService
from app.services.DrService import DoctorService


logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    async def get_current_user(
        session: AsyncSession,
        user_id: UUID,
        role: UserRoleV2
    ) -> Doctor | Patient | None:
        match role:
            case UserRoleV2.DOCTOR:
                return await DoctorService.get_doctor_by_id(
                    session=session,
                    doctor_id=user_id
                )

            case UserRoleV2.PATIENT:
                return await PatientService.get(
                    session=session,
                    ident_key="id",
                    ident_val=user_id
                )

            case _:
                return None

    @classmethod
    async def login_doctor(
        cls,
        credentials: DoctorLogin,
        session: AsyncSession
    ):
        """ lookup, authenticate credentials and issue session """

        method_used = "id" if credentials.id else "email"
        value = credentials.model_dump()[method_used]

        async with session.begin():
            db_user = await DoctorService.get(
                session=session,
                ident_key=method_used,
                ident_val=value
            )

            if db_user is None:
                raise EntityNotFoundException(
                    entity_name="doctor"
                )

            if not await security.authenticate_password_aio(
                pwd=credentials.password,
                hash=db_user.hash
            ):
                raise AuthenticationError(message="Invalid credentials")

            response_user = UserResponse.model_validate(db_user)
            access_token, refresh_token = cls.issue_session(
                session,
                db_user.id,
                UserRoleV2.DOCTOR
            )

        return access_token, refresh_token, response_user

    @classmethod
    async def login_patient(
            cls,
            session: AsyncSession,
            credentials: PatientLogin
    ):
        async with session.begin():
            db_user = await PatientService.get_by_email(
                session=session,
                email=credentials.email
            )

            if db_user is None:
                raise EntityNotFoundException(
                    entity_name="patient"
                )

            if not await security.authenticate_password_aio(
                pwd=credentials.password,
                hash=db_user.hash
            ):
                raise AuthenticationError(message="Invalid credentials..")

            response_user = UserResponse.model_validate(db_user)
            access_token, refresh_token = cls.issue_session(
                session,
                db_user.id,
                UserRoleV2.PATIENT
            )

        return access_token, refresh_token, response_user

    @classmethod
    async def register_doctor(
        cls,
        session: AsyncSession,
        payload: DrCreate
    ):
        try:
            async with session.begin():
                created = await DoctorService.create_doctor(
                    session=session,
                    data=payload
                )

                await session.flush()
                response_user = UserResponse.model_validate(created)

        except IntegrityError as e:
            raise AlreadyInUseException(
                field="email",
                message="An account with this email already exists."
            ) from e

        return response_user

    @classmethod
    async def register_patient(
        cls,
        session: AsyncSession,
        payload: PatientCreate
    ):
        try:
            async with session.begin():
                created = await PatientService.create_patient(
                    session=session,
                    data=payload
                )

                await session.flush()
                response_user = UserResponse.model_validate(created)

        except IntegrityError as e:
            raise AlreadyInUseException(
                field="email",
                message="An account with this email already exists."
            ) from e

        return response_user

    @classmethod
    def create_refresh_token(
        cls,
        user_id: UUID,
        role: UserRoleV2,
        family_id: UUID | None = None,
        family_expiry: datetime | None = None
    ):
        raw = secrets.token_urlsafe(nbytes=32)
        hashed = security.hash_token(raw)

        expiry = datetime.now(timezone.utc) + timedelta(days=14)

        record = RefreshToken(
            token_hash=hashed,
            user_id=user_id,
            user_role=role,
            expires_at=expiry,
            family_id=(
                family_id
                if family_id is not None
                else uuid4()
            ),
            family_expires_at=(
                family_expiry
                if family_expiry is not None
                else expiry
            )
        )

        return raw, record

    @classmethod
    async def rotate_refresh_token(
            cls,
            refresh_token: str,
            session: AsyncSession
    ) -> tuple[str, str]:
        now = datetime.now(timezone.utc)

        # 1. Atomically claim the token ONLY if it is unused, unrevoked, or unexpired.
        claim_stmt = (
            sa.select(RefreshToken)
            .where(
                (
                    RefreshToken.token_hash
                    == security.hash_token(refresh_token)
                ),
                RefreshToken.used_at.is_(None),
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > now,
                RefreshToken.family_expires_at > now
            )
            .with_for_update()
        )

        claimed_token = await session.scalar(claim_stmt)

        # 2. If claim failed, figure out why (expired, invalid, or REUSE ATTACK)
        if claimed_token is None:
            existing_token = await session.scalar(
                sa.select(RefreshToken)
                .where(
                    RefreshToken.token_hash
                    == security.hash_token(refresh_token)
                )
            )

            # Replay attack detected: token was already used!
            if (
                existing_token is not None
                and existing_token.used_at is not None
            ):
                # if the token is expired or revoked (reuse attempt),
                # revoke all assigned tokens of the same family.

                if (
                    (now - existing_token.used_at).total_seconds()
                    < 15
                ):
                    # ask client to wait for a grace window of 15s.
                    raise ConflictError(
                        code="refresh_in_progress",
                        message="You just recieved a newly issued refresh token. "
                        "Please retry after a few seconds ..",
                    )

                # revoke, commit, then raise
                await cls.revoke_against_family(
                    family_id=existing_token.family_id,
                    session=session
                )

                await session.commit()

            # Raising here does not roll back the family revocation above
            # as it is already (explicitly) safely committed!
            raise AuthenticationError(
                code="invalid_refresh_token",
                message="Your session has expired. Please login manually...",
                reason="Invalid or used refresh token.",
            )

        if (
            (now - claimed_token.created_at).total_seconds()
            <= 15
        ):
            return (
                (security.create_access_token(
                    claimed_token.user_id,
                    claimed_token.user_role,
                )), refresh_token
            )

        claimed_token.used_at = now
        session.add(claimed_token)

        # 3. Happy path: issue the next token in the same family using
        # the main session
        return cls.issue_session(
            session=session,
            user_id=claimed_token.user_id,
            role=claimed_token.user_role,
            family_id=claimed_token.family_id,
            family_expiry=claimed_token.family_expires_at
        )

    @classmethod
    async def get_refresh_token(
        cls,
        token: str,
        session: AsyncSession
    ) -> RefreshToken | None:
        stmt = (
            sa.select(RefreshToken)
            .where(
                RefreshToken.token_hash
                == security.hash_token(token)
            )
        )

        result = await session.scalar(stmt)
        return result

    @classmethod
    def issue_session(
        cls,
        session: AsyncSession,
        user_id: UUID,
        role: UserRoleV2,
        family_id: UUID | None = None,
        family_expiry: datetime | None = None
    ):
        refresh_token, record = cls.create_refresh_token(
            user_id=user_id,
            role=role,
            family_id=family_id,
            family_expiry=family_expiry
        )

        session.add(record)

        access_token = security.create_access_token(
            user_id=user_id,
            role=role
        )

        return access_token, refresh_token

    @staticmethod
    async def revoke_against_family(
        family_id: UUID,
        session: AsyncSession | None = None
    ):
        async def _execute(db: AsyncSession) -> None:
            stmt = (
                sa.update(RefreshToken)
                .returning(RefreshToken.id)
                .where(
                    RefreshToken.family_id == family_id,
                    RefreshToken.revoked_at.is_(None)
                )
                .values(revoked_at=datetime.now(timezone.utc))
            )

            await db.scalars(stmt)

        if session is not None:
            await _execute(session)

        else:
            async with AsyncSessionLocal() as short_session:
                async with short_session.begin():
                    await _execute(short_session)

    @staticmethod
    async def remove_account(
            user_id: UUID,
            role: UserRoleV2,
            session: AsyncSession | None
    ):
        async def _execute(db: AsyncSession) -> None:
            stmt = (
                sa.delete(
                    model := (
                        Doctor
                        if role is UserRoleV2.DOCTOR
                        else Patient
                    )
                )
                .where(model.id == user_id)
            )

            await db.scalar(stmt)

        if session is not None:
            await _execute(session)

        else:
            async with AsyncSessionLocal() as short_session:
                async with short_session.begin():
                    await _execute(short_session)

    @staticmethod
    async def get_user_by_email(
        email: str,
    ):
        async def _fetch_doctor():
            async with AsyncSessionLocal() as session:
                return await DoctorService.get_by_email(
                    session=session,
                    email=email
                )

        async def _fetch_patient():
            async with AsyncSessionLocal() as session:
                return await PatientService.get_by_email(
                    session=session,
                    email=email
                )

        patient, doctor = await asyncio.gather(
            _fetch_patient(),
            _fetch_doctor()
        )

        return patient or doctor

    @staticmethod
    async def reset_password(
        user_id: UUID,
        role: UserRoleV2,
        session: AsyncSession,
        password: str
    ):
        hashed_pwd = await security.hash_password_aio(pwd=password)

        stmt = (
            update(
                model := (
                    Doctor if role is UserRoleV2.DOCTOR
                    else Patient
                )
            )
            .where(model.id == user_id)
            .returning(model.email)
            .values({"hash": hashed_pwd})
        )

        email = await session.scalar(stmt)

        if email is None:
            raise AuthenticationError("The user could not be identified.")

        return email

    @classmethod
    async def mark_email_verified(
            cls,
            user_id: UUID,
            role: UserRoleV2,
            session: AsyncSession
    ):
        stmt = (
            update(
                model := (Doctor if (
                    role is UserRoleV2.DOCTOR
                ) else Patient)
            )
            .where(model.id == user_id)
            .values({"email_verified": True})
            .returning(model.email)
        )

        email = await session.scalar(stmt)

        if email is not None:
            return email
