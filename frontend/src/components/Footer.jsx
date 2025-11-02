import React from "react";
import { useTranslation } from 'react-i18next';

import { Link } from "react-router-dom"; 

import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

import isotipo from "../IMG/isotipo.png";


export default function Footer() {
  const { t } = useTranslation();
  return (
  <footer className="site-footer py-16">
      <div className="footer-inner max-w-7xl mx-auto px-4">
        {/* Organizacion del footer principal */}
        
  <div className="footer-grid grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Logo y descripción */}
          <div className="footer-logo">
              <div className="flex items-center mb-4">
              <img
                src={isotipo}
                alt="Logo Synapse"
                className="w-12 h-12 rounded-full mr-3"
              />
              <span className="text-2xl font-bold">{t('app_name', 'Synapse')}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {t('footer_description', 'Transformando el aprendizaje a través de la tecnología consciente y el desarrollo humano integral.')}
            </p>
            <div className="footer-social flex space-x-4">
           <a
    href="https://www.facebook.com/tu_pagina"
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-gray-400 hover:bg-white hover:text-[#111827] transform hover:-translate-y-1 hover:scale-110 transition"
  >
    <FaFacebookF />
  </a>
  <a
    href="https://twitter.com/tu_usuario"
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-gray-400 hover:bg-white hover:text-[#111827] transform hover:-translate-y-1 hover:scale-110 transition"
  >
    <FaTwitter />
  </a>
  <a
    href="https://www.linkedin.com/in/tu_perfil"
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-gray-400 hover:bg-white hover:text-[#111827] transform hover:-translate-y-1 hover:scale-110 transition"
  >
    <FaLinkedinIn />
  </a>
  <a
    href="https://www.instagram.com/tu_usuario"
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-gray-400 hover:bg-white hover:text-[#111827] transform hover:-translate-y-1 hover:scale-110 transition"
  >
    <FaInstagram />
  </a>
</div>
          </div>




          {/* Plataforma */}
          <div className="footer-links">
              <h3 className="footer-title">{t('platform', 'Platform')}</h3>
            <ul>
              <li>
                <Link to="/tareas" className="text-gray-400 hover:text-white hover:translate-x-1 transition">{t('tasks', 'Tareas')}</Link>
              </li>
              <li>
                <Link to="/recompensas" className="text-gray-400 hover:text-white hover:translate-x-1 transition">{t('rewards', 'Recompensas')}</Link>
              </li>

              <li>
                <Link 
                  to="/pomodoro" 
                  className="text-gray-400 hover:text-white hover:translate-x-1 transition"
                >
                  {t('pomodoro')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/meditacion" 
                  className="text-gray-400 hover:text-white hover:translate-x-1 transition"
                >
                  {t('meditation')}
                </Link>
              </li>
            </ul>
          </div>



          {/* Recursos */}
          <div className="footer-links">
            <h3 className="footer-title">{t('resources', 'Resources')}</h3>
            <ul>
              <li><a href="#">{t('blog', 'Blog')}</a></li>
              <li><a href="#">{t('guides', 'Guides')}</a></li>
              <li><a href="#">{t('webinars', 'Webinars')}</a></li>
              <li><a href="#">{t('community', 'Community')}</a></li>
            </ul>
          </div>



          {/* Soporte */}
          <div className="footer-links">
            <h3 className="footer-title">{t('support', 'Support')}</h3>
            <ul>
              <li><a href="#">{t('help_center', 'Help Center')}</a></li>
              <li><a href="#">{t('contact', 'Contact')}</a></li>
              <li><a href="#">{t('faq', 'FAQ')}</a></li>
              <li><a href="#">{t('terms', 'Terms')}</a></li>
            </ul>
          </div>
        </div>



        {/* Parte inferior */}
        <div className="footer-bottom pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2025 {t('app_name', 'Synapse')}. {t('all_rights', 'All rights reserved.')}</p>
          <div className="footer-legal flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">{t('privacy', 'Privacy')}</a>
            <a href="#" className="hover:text-white transition">{t('cookies', 'Cookies')}</a>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
