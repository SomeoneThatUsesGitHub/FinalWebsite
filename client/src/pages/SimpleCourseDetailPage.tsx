import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Helmet } from 'react-helmet';
import { ChevronLeft } from 'lucide-react';

// Types pour les chapitres et leçons
interface Lesson {
  id: number;
  title: string;
  content: string;
}

interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
}

// Données d'exemple pour un cours
const courseData = {
  id: 1,
  title: "L'Assemblée Nationale",
  slug: "assemblee-nationale",
  description: "Découvrez le fonctionnement et le rôle de l'Assemblée Nationale dans la démocratie française.",
  category: "Institutions",
  chapters: [
    {
      id: 1,
      title: "Introduction à l'Assemblée Nationale",
      lessons: [
        {
          id: 101,
          title: "Histoire de l'Assemblée Nationale",
          content: `
            <div class="flex items-center space-x-2 mb-6">
              <div class="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-blue-600 font-medium">Temps de lecture estimé</p>
                <p class="text-gray-800 font-bold">10 minutes</p>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-8 flex items-start">
              <div class="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-blue-700">Points essentiels</p>
                <ul class="mt-2 space-y-1 text-blue-800">
                  <li>L'Assemblée nationale est née officiellement le 17 juin 1789</li>
                  <li>Elle tire ses origines des États généraux convoqués par Louis XVI</li>
                  <li>Le Serment du Jeu de paume est un moment fondateur</li>
                </ul>
              </div>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span class="bg-blue-600 w-8 h-8 flex items-center justify-center rounded-full mr-2 flex-shrink-0">
                <span class="text-white text-sm font-bold">1</span>
              </span>
              Les origines de l'Assemblée Nationale
            </h2>
            
            <p class="mb-4">L'Assemblée nationale française est née officiellement le <span class="font-semibold bg-yellow-100 px-1">17 juin 1789</span>, lorsque les députés du tiers état se sont proclamés "Assemblée nationale" pendant la Révolution française.</p>
            
            <div class="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
              <p class="italic">« Nous sommes aujourd'hui ce que nous étions hier, délibérons. »</p>
              <p class="text-right text-sm mt-2">— Abbé Sieyès, député du tiers état</p>
            </div>
            
            <p class="mb-4">C'est le résultat direct des États généraux convoqués par Louis XVI pour résoudre la crise financière que traversait le royaume. Les députés du tiers état, rejoints par quelques membres du clergé et de la noblesse, ont décidé de se constituer en une assemblée représentant la nation tout entière.</p>
            
            <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8 flex items-center">
              <span class="bg-blue-600 w-8 h-8 flex items-center justify-center rounded-full mr-2 flex-shrink-0">
                <span class="text-white text-sm font-bold">2</span>
              </span>
              Le Serment du Jeu de paume
            </h2>
            
            <p class="mb-4">Le 20 juin 1789, les députés se réunissent dans la salle du Jeu de paume à Versailles et jurent de ne pas se séparer avant d'avoir doté la France d'une Constitution. C'est le célèbre "Serment du Jeu de paume", immortalisé par le peintre Jacques-Louis David.</p>
                
            <p class="mb-4">Cet acte symbolique marque une rupture définitive avec la monarchie absolue et pose les bases d'un régime représentatif où la souveraineté appartient désormais à la nation et non plus au roi.</p>
            
            <div class="my-6">
              <div class="relative">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Le_Serment_du_Jeu_de_paume.jpg/800px-Le_Serment_du_Jeu_de_paume.jpg" alt="Le Serment du Jeu de paume" class="rounded-lg shadow-md mx-auto" />
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 rounded-b-lg">
                  <p class="text-sm font-medium">Le Serment du Jeu de paume par Jacques-Louis David (1791)</p>
                </div>
              </div>
            </div>
            
            <div class="flex items-center p-3 bg-blue-50 rounded-lg my-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span class="text-blue-700 font-medium">Le Serment du Jeu de paume est considéré comme l'acte fondateur de la démocratie française moderne.</span>
            </div>
            
            <div class="border border-gray-200 rounded-lg p-5 my-8 bg-gray-50">
              <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Chronologie des événements clés
              </h3>
              
              <div class="space-y-4 ml-6 relative before:absolute before:inset-y-0 before:left-[-15px] before:w-[2px] before:bg-blue-200">
                <div class="relative">
                  <div class="absolute left-[-23px] top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                  <div>
                    <p class="font-semibold">5 mai 1789</p>
                    <p class="text-gray-600">Ouverture des États généraux à Versailles</p>
                  </div>
                </div>
                
                <div class="relative">
                  <div class="absolute left-[-23px] top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                  <div>
                    <p class="font-semibold">17 juin 1789</p>
                    <p class="text-gray-600">Le tiers état se proclame Assemblée nationale</p>
                  </div>
                </div>
                
                <div class="relative">
                  <div class="absolute left-[-23px] top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                  <div>
                    <p class="font-semibold">20 juin 1789</p>
                    <p class="text-gray-600">Serment du Jeu de paume</p>
                  </div>
                </div>
                
                <div class="relative">
                  <div class="absolute left-[-23px] top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                  <div>
                    <p class="font-semibold">9 juillet 1789</p>
                    <p class="text-gray-600">L'Assemblée nationale devient l'Assemblée nationale constituante</p>
                  </div>
                </div>
              </div>
            </div>
          `
        },
        {
          id: 102,
          title: "Rôle constitutionnel",
          content: `
            <div class="flex items-center space-x-2 mb-6">
              <div class="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-blue-600 font-medium">Temps de lecture estimé</p>
                <p class="text-gray-800 font-bold">8 minutes</p>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-8 flex items-start">
              <div class="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-blue-700">Points essentiels</p>
                <ul class="mt-2 space-y-1 text-blue-800">
                  <li>L'Assemblée nationale exerce trois fonctions principales : législative, de contrôle et d'évaluation</li>
                  <li>Elle vote les lois et a le dernier mot en cas de désaccord avec le Sénat</li>
                  <li>Elle contrôle l'action du gouvernement via plusieurs mécanismes</li>
                </ul>
              </div>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Le rôle de l'Assemblée Nationale dans la Constitution</h2>
            
            <p class="mb-6">Dans le cadre de la Ve République, l'Assemblée nationale occupe une place centrale dans les institutions françaises. Sa mission est définie par l'<span class="font-semibold bg-yellow-100 px-1">article 24 de la Constitution</span> qui lui confère trois fonctions essentielles.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              <div class="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-600">
                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Fonction législative</h3>
                <p class="text-gray-600">L'Assemblée nationale vote les lois et dispose du dernier mot face au Sénat.</p>
              </div>
              
              <div class="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-600">
                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Fonction de contrôle</h3>
                <p class="text-gray-600">Elle contrôle l'action du gouvernement par divers moyens comme les questions et les commissions d'enquête.</p>
              </div>
              
              <div class="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-600">
                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Évaluation des politiques</h3>
                <p class="text-gray-600">Depuis 2008, elle évalue les politiques publiques pour vérifier leur efficacité et leur pertinence.</p>
              </div>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-3 mt-8 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              1. La fonction législative
            </h3>
            
            <p class="mb-4">L'Assemblée nationale vote les lois, soit sur proposition du gouvernement (projets de loi), soit à l'initiative des parlementaires eux-mêmes (propositions de loi). Elle a le dernier mot en cas de désaccord avec le Sénat, ce qui lui confère une position prééminente dans le processus législatif.</p>
            
            <div class="my-6 bg-white p-4 rounded-lg border border-gray-200 flex">
              <div class="mr-4 flex-shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Assembl%C3%A9e_nationale_fran%C3%A7aise_-_les_votes.jpg/640px-Assembl%C3%A9e_nationale_fran%C3%A7aise_-_les_votes.jpg" alt="Vote à l'Assemblée nationale" class="w-32 h-auto rounded" />
              </div>
              <div>
                <h4 class="font-bold text-gray-800 mb-2">Le processus législatif</h4>
                <ol class="list-decimal list-inside text-gray-600 space-y-1">
                  <li>Dépôt du texte (projet ou proposition de loi)</li>
                  <li>Examen en commission</li>
                  <li>Discussion et vote en séance plénière</li>
                  <li>Navette entre l'Assemblée et le Sénat</li>
                  <li>En cas de désaccord persistant, l'Assemblée peut statuer définitivement</li>
                </ol>
              </div>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-3 mt-8 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              2. La fonction de contrôle
            </h3>
            
            <p class="mb-4">L'Assemblée nationale contrôle l'action du gouvernement par différents moyens :</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div class="bg-gray-50 p-4 rounded-lg flex items-start">
                <span class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5 flex-shrink-0">A</span>
                <div>
                  <p class="font-medium">Questions au gouvernement</p>
                  <p class="text-sm text-gray-600">Sessions de questions-réponses lors des séances des mardis et mercredis</p>
                </div>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg flex items-start">
                <span class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5 flex-shrink-0">B</span>
                <div>
                  <p class="font-medium">Commissions d'enquête</p>
                  <p class="text-sm text-gray-600">Investigations approfondies sur des sujets d'intérêt public</p>
                </div>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg flex items-start">
                <span class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5 flex-shrink-0">C</span>
                <div>
                  <p class="font-medium">Motion de censure</p>
                  <p class="text-sm text-gray-600">Procédure permettant de renverser le gouvernement</p>
                </div>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg flex items-start">
                <span class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5 flex-shrink-0">D</span>
                <div>
                  <p class="font-medium">Contrôle de l'application des lois</p>
                  <p class="text-sm text-gray-600">Suivi de la mise en œuvre effective des textes votés</p>
                </div>
              </div>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-3 mt-8 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              3. L'évaluation des politiques publiques
            </h3>
            
            <p class="mb-4">Depuis la révision constitutionnelle de 2008, l'Assemblée nationale a également pour mission d'évaluer les politiques publiques. Elle vérifie leur efficacité, leur coût et leur pertinence.</p>
            
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg my-6">
              <h4 class="font-bold text-blue-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Article 24 de la Constitution
              </h4>
              <blockquote class="italic">
                "Le Parlement vote la loi. Il contrôle l'action du Gouvernement. Il évalue les politiques publiques."
              </blockquote>
              <p class="text-sm text-blue-700 mt-2">Cet article définit les trois missions fondamentales du Parlement, dont fait partie l'Assemblée nationale.</p>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-semibold text-yellow-800">À retenir :</p>
                <p class="text-yellow-700">En cas de désaccord entre l'Assemblée nationale et le Sénat sur un texte de loi, le Gouvernement peut donner le "dernier mot" à l'Assemblée nationale après deux lectures dans chaque chambre. C'est ce qu'on appelle la procédure du "dernier mot".</p>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 2,
      title: "Fonctionnement et Organisation",
      lessons: [
        {
          id: 201,
          title: "Les députés",
          content: `
            <div class="flex items-center space-x-2 mb-6">
              <div class="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-blue-600 font-medium">Temps de lecture estimé</p>
                <p class="text-gray-800 font-bold">9 minutes</p>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-8 flex items-start">
              <div class="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-blue-700">Points essentiels</p>
                <ul class="mt-2 space-y-1 text-blue-800">
                  <li>L'Assemblée nationale compte 577 députés élus pour 5 ans</li>
                  <li>Les députés sont élus au scrutin majoritaire à deux tours</li>
                  <li>Depuis 2017, le cumul des mandats est interdit</li>
                </ul>
              </div>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Les députés de l'Assemblée Nationale
            </h2>
            
            <p class="mb-4">L'Assemblée nationale comprend <span class="font-semibold bg-yellow-100 px-1">577 députés</span> élus pour un mandat de 5 ans au suffrage universel direct. Ils représentent à la fois leur circonscription et la nation tout entière.</p>
            
            <div class="my-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Hemicycle_of_the_National_Assembly_of_France%2C_27_November_2021.jpg" alt="Hémicycle de l'Assemblée nationale" class="w-full h-auto rounded-lg shadow-md" />
              <p class="text-sm text-gray-600 italic text-center mt-2">L'hémicycle de l'Assemblée nationale au Palais Bourbon à Paris, siège des députés français</p>
            </div>
            
            <div class="bg-gray-100 rounded-lg p-4 my-4">
              <h3 class="font-bold text-gray-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Composition actuelle (16e législature 2022-2027)
              </h3>
              <p class="text-gray-700">Suite aux élections législatives de 2022, l'Assemblée nationale est composée de plusieurs groupes politiques, aucun ne disposant de la majorité absolue (289 sièges), ce qui constitue une situation inédite sous la Ve République.</p>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-3 mt-6">Mode d'élection</h3>
            
            <p class="mb-4">Les députés sont élus au scrutin uninominal majoritaire à deux tours dans le cadre de circonscriptions. La France métropolitaine et d'outre-mer est divisée en 577 circonscriptions :</p>
            
            <p class="mb-4">
              • <strong>556</strong> circonscriptions pour la France métropolitaine<br>
              • <strong>10</strong> circonscriptions pour les DOM-TOM<br>
              • <strong>11</strong> circonscriptions pour les Français établis hors de France
            </p>
            
            <div class="bg-blue-50 p-4 rounded-lg my-6 border-l-4 border-blue-400">
              <p class="text-blue-800">
                <span class="font-semibold">À noter : </span> 
                Contrairement à d'autres pays, la France a choisi un scrutin majoritaire plutôt que proportionnel pour l'élection des députés, afin de favoriser l'émergence de majorités stables.
              </p>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-3 mt-8">Statut du député</h3>
            
            <p class="mb-4">Le statut de député confère plusieurs droits et devoirs :</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                <div class="bg-blue-600 h-2"></div>
                <div class="p-5">
                  <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 class="font-bold text-gray-800 mb-2">Immunité parlementaire</h4>
                  <p class="text-gray-600">Protection contre certaines poursuites judiciaires pendant l'exercice de leur mandat.</p>
                </div>
              </div>
              
              <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                <div class="bg-blue-600 h-2"></div>
                <div class="p-5">
                  <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 class="font-bold text-gray-800 mb-2">Indemnité parlementaire</h4>
                  <p class="text-gray-600">Rémunération mensuelle d'environ 7.200 euros bruts, complétée par diverses indemnités.</p>
                </div>
              </div>
              
              <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                <div class="bg-blue-600 h-2"></div>
                <div class="p-5">
                  <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h4 class="font-bold text-gray-800 mb-2">Non-cumul des mandats</h4>
                  <p class="text-gray-600">Depuis 2017, un député ne peut plus cumuler son mandat avec une fonction exécutive locale.</p>
                </div>
              </div>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-5 my-8">
              <h3 class="font-bold text-blue-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Perspective historique
              </h3>
              <p class="text-blue-700 mb-2">Le nombre de députés a évolué au fil des législatures de la Ve République :</p>
              <ul class="text-blue-800 list-disc list-inside space-y-1">
                <li>465 députés à l'origine (1958)</li>
                <li>Augmentation à 577 députés en 1986 lors du passage temporaire au scrutin proportionnel</li>
                <li>Maintien de ce nombre après le retour au scrutin majoritaire en 1988</li>
              </ul>
            </div>
          `
        },
        {
          id: 202,
          title: "Les commissions parlementaires",
          content: `
            <div class="flex items-center space-x-2 mb-6">
              <div class="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-blue-600 font-medium">Temps de lecture estimé</p>
                <p class="text-gray-800 font-bold">7 minutes</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-8 flex items-start">
              <div class="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-blue-700">Points essentiels</p>
                <ul class="mt-2 space-y-1 text-blue-800">
                  <li>L'Assemblée nationale compte 8 commissions permanentes depuis 2008</li>
                  <li>Chaque député est membre d'une seule commission permanente</li>
                  <li>Les commissions examinent les projets et propositions de loi avant leur discussion en séance</li>
                </ul>
              </div>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Les commissions parlementaires
            </h2>
            
            <p class="text-lg text-gray-700 mb-6">Pour organiser efficacement son travail, l'Assemblée nationale est divisée en plusieurs commissions permanentes. Ces commissions jouent un rôle crucial dans l'examen des projets et propositions de loi avant leur discussion en séance plénière.</p>
            
            <div class="relative my-8 overflow-hidden rounded-xl bg-white shadow-lg p-1">
              <div class="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div class="pt-4 px-6 pb-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Rôle des commissions</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-start">
                    <div class="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium">Examen préalable des textes</p>
                      <p class="text-sm text-gray-600">Les commissions examinent en détail les projets et propositions de loi avant leur discussion en séance publique.</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start">
                    <div class="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium">Amendements et modifications</p>
                      <p class="text-sm text-gray-600">Elles peuvent amender et modifier les textes pour améliorer leur qualité et leur applicabilité.</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start">
                    <div class="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium">Auditions</p>
                      <p class="text-sm text-gray-600">Les commissions procèdent à des auditions de ministres, d'experts et de personnes concernées par les sujets examinés.</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start">
                    <div class="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium">Contrôle et évaluation</p>
                      <p class="text-sm text-gray-600">Elles contribuent au contrôle de l'action du gouvernement et à l'évaluation des politiques publiques dans leur domaine.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-4 mt-8">Les huit commissions permanentes</h3>
            
            <p class="mb-6">Depuis la révision constitutionnelle de 2008, l'Assemblée nationale compte huit commissions permanentes :</p>
            
            <p class="mb-4">
              <strong>1. Commission des affaires culturelles et de l'éducation :</strong> Éducation, enseignement supérieur, recherche, jeunesse, sports, culture, communication<br><br>
              <strong>2. Commission des affaires économiques :</strong> Agriculture, énergie, industrie, commerce, consommation, numérique, tourisme<br><br>
              <strong>3. Commission des affaires étrangères :</strong> Politique étrangère, relations internationales, traités, organisations internationales<br><br>
              <strong>4. Commission des affaires sociales :</strong> Santé, solidarité, travail, emploi, formation professionnelle, retraites
            </p>
            
            <div class="my-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Commission_Defense_Assemblee_Nationale.jpg/800px-Commission_Defense_Assemblee_Nationale.jpg" alt="Commission de la défense nationale" class="w-full h-auto rounded-lg shadow-md" />
              <p class="text-sm text-gray-600 italic text-center mt-2">Réunion de la Commission de la défense nationale à l'Assemblée Nationale</p>
            </div>
            
            <p class="mb-4">
              <strong>5. Commission de la défense nationale :</strong> Organisation générale de la défense, politique militaire, armement<br><br>
              <strong>6. Commission du développement durable :</strong> Environnement, transports, infrastructures, aménagement du territoire<br><br>
              <strong>7. Commission des finances :</strong> Budget, fiscalité, finances publiques, contrôle budgétaire<br><br>
              <strong>8. Commission des lois :</strong> Constitution, lois, justice, libertés publiques, collectivités territoriales
            </p>
            
            <h3 class="text-xl font-bold text-gray-800 mb-4 mt-8">Commissions spéciales et commissions d'enquête</h3>
            
            <div class="flex flex-col md:flex-row gap-6 my-6">
              <div class="md:w-1/2 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center mb-3">
                  <div class="bg-blue-100 rounded-full p-3 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 class="font-bold text-lg">Commissions spéciales</h4>
                </div>
                <p class="text-gray-700 mb-3">Des commissions spéciales peuvent être créées pour l'examen d'un projet ou d'une proposition de loi particulière.</p>
                <p class="text-gray-700">Elles sont formées temporairement et se dissolvent après l'adoption ou le rejet du texte qui a motivé leur création.</p>
              </div>
              
              <div class="md:w-1/2 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center mb-3">
                  <div class="bg-blue-100 rounded-full p-3 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h4 class="font-bold text-lg">Commissions d'enquête</h4>
                </div>
                <p class="text-gray-700 mb-3">Les commissions d'enquête sont créées pour recueillir des informations sur des faits déterminés et formuler des conclusions.</p>
                <p class="text-gray-700">Elles sont dotées de pouvoirs d'investigation étendus et leurs travaux donnent lieu à un rapport public.</p>
              </div>
            </div>
            
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg my-8 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-semibold text-yellow-800">À noter :</p>
                <p class="text-yellow-700 mb-2">Chaque député est membre d'une commission permanente, et une seule.</p>
                <p class="text-yellow-700">La composition des commissions respecte la configuration politique de l'Assemblée. Ainsi, chaque groupe politique est représenté proportionnellement à son importance numérique.</p>
              </div>
            </div>
          `
        }
      ]
    }
  ]
};

const SimpleCourseDetailPage: React.FC = () => {
  const [match, params] = useRoute('/apprendre/:courseSlug');
  const courseSlug = params?.courseSlug || '';
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [activeLessonId, setActiveLessonId] = useState(101);
  
  // Trouver le cours correspondant au slug (simulation)
  const course = courseData.slug === courseSlug ? courseData : null;
  
  // Si le cours n'est pas trouvé
  if (!course) {
    return (
      <motion.div 
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="container mx-auto px-4 py-12 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cours non trouvé</h1>
        <p className="text-gray-600 mb-6">Le cours que vous recherchez n'existe pas ou a été déplacé.</p>
        <Link href="/apprendre">
          <a className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Retour aux cours
          </a>
        </Link>
      </motion.div>
    );
  }
  
  // Trouver le chapitre et la leçon actifs
  const activeChapter = course.chapters.find(chapter => chapter.id === activeChapterId);
  const activeLesson = activeChapter?.lessons.find(lesson => lesson.id === activeLessonId);

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gray-50"
    >
      <Helmet>
        <title>{course.title} | Apprendre | Politiquensemble</title>
        <meta name="description" content={course.description} />
      </Helmet>
      
      {/* En-tête du cours - Version améliorée et plus attractive */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-8 md:py-12 shadow-lg relative overflow-hidden">
        {/* Formes décoratives en arrière-plan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 opacity-10 rounded-full -ml-40 -mb-40"></div>
        <div className="absolute bottom-1/2 right-1/4 w-40 h-40 bg-white opacity-5 rounded-full"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/apprendre">
            <a className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors bg-blue-700 bg-opacity-30 px-3 py-1 rounded-full">
              <ChevronLeft className="h-5 w-5 mr-1" />
              Retour aux cours
            </a>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="md:w-3/5">
              <div className="flex items-center mb-3">
                <span className="inline-block bg-blue-900 bg-opacity-50 text-blue-100 px-3 py-1 rounded-full text-sm font-medium mr-3">
                  {course.category}
                </span>
                <span className="text-blue-100 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lecture estimée : 20-30 min
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">{course.title}</h1>
              <p className="text-blue-100 md:text-lg">{course.description}</p>
              
              <div className="mt-6 hidden md:block">
                <div className="inline-flex items-center text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.chapters.length} chapitres • {course.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)} leçons
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 md:w-2/5">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Palais_Bourbon_front.jpg" 
                  alt="Palais Bourbon - Siège de l'Assemblée Nationale" 
                  className="w-full h-auto"
                />
                <div className="bg-white bg-opacity-90 p-2 absolute bottom-0 left-0 right-0">
                  <p className="text-xs text-center text-gray-700 font-medium">Le Palais Bourbon, siège de l'Assemblée Nationale française</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal - Layout à deux colonnes */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Colonne de gauche - Liste des chapitres et leçons */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Sommaire</h2>
              
              <div className="space-y-4">
                {course.chapters.map((chapter) => (
                  <div key={chapter.id} className="space-y-2">
                    <h3 
                      className="font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                      onClick={() => setActiveChapterId(chapter.id)}
                    >
                      {chapter.title}
                    </h3>
                    
                    {activeChapterId === chapter.id && (
                      <ul className="pl-4 space-y-1 border-l-2 border-gray-200">
                        {chapter.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <button
                              className={`text-left text-sm w-full py-1 px-2 rounded ${
                                activeLessonId === lesson.id
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                              onClick={() => setActiveLessonId(lesson.id)}
                            >
                              {lesson.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Colonne de droite - Contenu de la leçon */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeLesson ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b">
                    {activeLesson.title}
                  </h2>
                  
                  <div className="prose prose-blue max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      onClick={() => {
                        // Logique pour trouver la leçon précédente
                        const currentChapterIndex = course.chapters.findIndex(c => c.id === activeChapterId);
                        const currentLessonIndex = course.chapters[currentChapterIndex].lessons.findIndex(l => l.id === activeLessonId);
                        
                        if (currentLessonIndex > 0) {
                          // Leçon précédente dans le même chapitre
                          setActiveLessonId(course.chapters[currentChapterIndex].lessons[currentLessonIndex - 1].id);
                        } else if (currentChapterIndex > 0) {
                          // Dernière leçon du chapitre précédent
                          const prevChapter = course.chapters[currentChapterIndex - 1];
                          setActiveChapterId(prevChapter.id);
                          setActiveLessonId(prevChapter.lessons[prevChapter.lessons.length - 1].id);
                        }
                      }}
                    >
                      Précédent
                    </button>
                    
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        // Logique pour trouver la leçon suivante
                        const currentChapterIndex = course.chapters.findIndex(c => c.id === activeChapterId);
                        const currentLessonIndex = course.chapters[currentChapterIndex].lessons.findIndex(l => l.id === activeLessonId);
                        
                        if (currentLessonIndex < course.chapters[currentChapterIndex].lessons.length - 1) {
                          // Leçon suivante dans le même chapitre
                          setActiveLessonId(course.chapters[currentChapterIndex].lessons[currentLessonIndex + 1].id);
                        } else if (currentChapterIndex < course.chapters.length - 1) {
                          // Première leçon du chapitre suivant
                          const nextChapter = course.chapters[currentChapterIndex + 1];
                          setActiveChapterId(nextChapter.id);
                          setActiveLessonId(nextChapter.lessons[0].id);
                        }
                      }}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Sélectionnez une leçon pour commencer</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SimpleCourseDetailPage;