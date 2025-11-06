import os
from datetime import timedelta

class Config:
    # Configuración de base de datos MariaDB
    # Cambiado por defecto a user=root password=root puerto 3306 (según solicitud)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:root@localhost:3307/synapse_db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'tu-clave-secreta-muy-segura'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Configuración CORS - permitir frontend en desarrollo (puertos 3000 y 5173)
    # Añade aquí otros orígenes si pruebas desde otra máquina/host
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']
    
    # Configuración general
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'otra-clave-secreta'

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}