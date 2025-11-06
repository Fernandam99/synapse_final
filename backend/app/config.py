import os
from datetime import timedelta

class Config:
    # Configuración de base de datos MariaDB
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:koal@localhost:3307/synapse_db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'tu-clave-secreta-muy-segura'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Configuración CORS
    CORS_ORIGINS = ['http://localhost:3000'] # Cambiar según el frontend
    
    # Configuración general
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'otra-clave-secreta'

class DevelopmentConfig(Config):
    DEBUG = True
    # Para facilitar la generación de migraciones en desarrollo local sin
    # depender de la configuración del servidor MySQL (p. ej. plugins GSSAPI),
    # por defecto en development usamos una base SQLite local que no requiere
    # autenticación especial. Si quieres usar MySQL en dev, define la
    # variable de entorno DEV_DATABASE_URL con la URI correspondiente.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or 'sqlite:///./dev_migrations.db'

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}