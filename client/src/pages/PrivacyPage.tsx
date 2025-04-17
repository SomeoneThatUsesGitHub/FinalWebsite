import React from "react";
import MainLayout from "../components/layout/MainLayout";

const PrivacyPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-blue">
          <h1 className="text-3xl font-bold mb-6 text-center">Politique de confidentialité</h1>
          
          <div className="space-y-6 mt-8">
            <p className="text-gray-600 italic">
              Date de dernière mise à jour : 12 mars 2025
            </p>
            
            <div>
              <h2 className="text-xl font-semibold">Introduction</h2>
              <p>
                Chez Politiquensemble, nous accordons une grande importance à la protection de vos données personnelles. 
                Cette politique de confidentialité vous informe sur la façon dont nous collectons, utilisons, partageons 
                et protégeons vos informations lorsque vous utilisez notre site web.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Données collectées</h2>
              <p>Nous pouvons collecter les types d'informations suivants :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Informations d'identification :</strong> Nom, prénom, adresse e-mail lorsque vous vous 
                  inscrivez à notre newsletter ou que vous nous contactez via notre formulaire de contact.
                </li>
                <li>
                  <strong>Informations de connexion :</strong> Nom d'utilisateur et mot de passe si vous créez un compte.
                </li>
                <li>
                  <strong>Données d'utilisation :</strong> Informations sur la façon dont vous interagissez avec notre 
                  site (pages visitées, temps passé sur le site, etc.).
                </li>
                <li>
                  <strong>Commentaires et réactions :</strong> Lorsque vous laissez des commentaires sur des articles 
                  ou des réactions aux résultats d'élections.
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Utilisation des données</h2>
              <p>Nous utilisons vos données personnelles pour :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Fournir, maintenir et améliorer notre site web</li>
                <li>Vous envoyer notre newsletter si vous vous y êtes inscrit</li>
                <li>Répondre à vos demandes et questions</li>
                <li>Personnaliser votre expérience sur notre site</li>
                <li>Analyser l'utilisation de notre site pour l'améliorer</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Cookies et technologies similaires</h2>
              <p>
                Notre site utilise des cookies et des technologies similaires pour améliorer votre expérience, 
                analyser l'utilisation du site et personnaliser le contenu. Vous pouvez gérer vos préférences 
                concernant les cookies via les paramètres de votre navigateur.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Partage des données</h2>
              <p>
                Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager vos informations 
                dans les circonstances suivantes :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Avec des prestataires de services qui nous aident à gérer le site</li>
                <li>Si la loi l'exige ou pour protéger nos droits</li>
                <li>En cas de fusion, vente ou transfert d'actifs, avec l'entité concernée</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles 
                contre tout accès non autorisé, altération, divulgation ou destruction.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Vos droits</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement (droit à l'oubli)</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
              <p>
                Pour exercer ces droits, veuillez nous contacter à l'adresse : info@politiquensemble.com
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Modifications de la politique de confidentialité</h2>
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité périodiquement. 
                La date de la dernière mise à jour sera indiquée en haut de cette page. 
                Nous vous encourageons à consulter régulièrement cette politique pour rester informé 
                de la façon dont nous protégeons vos informations.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Contact</h2>
              <p>
                Si vous avez des questions concernant cette politique de confidentialité, 
                veuillez nous contacter à : info@politiquensemble.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPage;