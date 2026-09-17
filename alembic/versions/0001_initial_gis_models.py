"""Initial GIS Models Migration

Revision ID: 0001_initial_gis_models
Revises: 
Create Date: 2026-09-16 09:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '0001_initial_gis_models'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable PostGIS Extension if not already present
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 2. Create devices table
    op.create_table(
        'devices',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=False),
        sa.Column('device_type', sa.Enum('Mikrotik', 'OLT', name='devicetype', native_enum=False), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('online', 'offline', name='devicestatus', native_enum=False), nullable=False),
        sa.Column('last_seen', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_devices_id'), 'devices', ['id'], unique=False)
    op.create_index(op.f('ix_devices_ip_address'), 'devices', ['ip_address'], unique=False)

    # 3. Create odps table
    op.create_table(
        'odps',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('code', sa.String(length=100), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('total_ports', sa.Integer(), nullable=False),
        sa.Column('used_ports', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('active', 'full', 'maintenance', name='odpstatus', native_enum=False), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    op.create_index(op.f('ix_odps_code'), 'odps', ['code'], unique=True)
    op.create_index(op.f('ix_odps_id'), 'odps', ['id'], unique=False)

    # 4. Create fiber_cables table with PostGIS geometry LineString
    op.create_table(
        'fiber_cables',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('geometry', geoalchemy2.types.Geometry(geometry_type='LINESTRING', srid=4326, from_text='ST_GeomFromEWKT', name='geometry', spatial_index=True), nullable=False),
        sa.Column('core_capacity', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_fiber_cables_id'), 'fiber_cables', ['id'], unique=False)

    # 5. Create customer_onus table
    op.create_table(
        'customer_onus',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('pppoe_username', sa.String(length=100), nullable=False),
        sa.Column('odp_id', sa.Integer(), nullable=False),
        sa.Column('port_number', sa.Integer(), nullable=False),
        sa.Column('rx_power', sa.Float(), nullable=True),
        sa.Column('status', sa.Enum('online', 'offline', 'los', name='onustatus', native_enum=False), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['odp_id'], ['odps.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_customer_onus_id'), 'customer_onus', ['id'], unique=False)
    op.create_index(op.f('ix_customer_onus_pppoe_username'), 'customer_onus', ['pppoe_username'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_customer_onus_pppoe_username'), table_name='customer_onus')
    op.drop_index(op.f('ix_customer_onus_id'), table_name='customer_onus')
    op.drop_table('customer_onus')

    op.drop_index(op.f('ix_fiber_cables_id'), table_name='fiber_cables')
    op.drop_table('fiber_cables')

    op.drop_index(op.f('ix_odps_id'), table_name='odps')
    op.drop_index(op.f('ix_odps_code'), table_name='odps')
    op.drop_table('odps')

    op.drop_index(op.f('ix_devices_ip_address'), table_name='devices')
    op.drop_index(op.f('ix_devices_id'), table_name='devices')
    op.drop_table('devices')
