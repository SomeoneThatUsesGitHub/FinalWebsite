import React from "react";
import MainLayout from "../components/layout/MainLayout";

const LegalPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-blue">
          <h1 className="text-3xl font-bold mb-6 text-center">Nos mentions légales, car la transparence, ça compte pour nous</h1>
          
          <div className="space-y-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold">Éditeur :</h2>
              <p>Politiquensemble</p>
              <p>info@politiquensemble.be</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Directeur de production :</h2>
              <p>Heine Noah</p>
              <p>noah@politiquensemble.be</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Hébergement :</h2>
              <p>Gandi Hébergeur</p>
              <p><a href="https://gandi.net/fr/domain" className="text-blue-600 hover:underline">https://gandi.net/fr/domain</a></p>
              <p><a href="https://gandi.net/fr/contact" className="text-blue-600 hover:underline">https://gandi.net/fr/contact</a></p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Propriété intellectuelle :</h2>
              <p>
                Ce site et son contenu sont protégés par les lois sur la propriété intellectuelle et les droits d'auteur. 
                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations 
                iconographiques et photographiques.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Données personnelles :</h2>
              <p>
                Ce site peut collecter et utiliser des données personnelles conformément à notre politique de confidentialité, 
                que vous pouvez consulter <a href="/confidentialite" className="text-blue-600 hover:underline">ici</a>.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Cookies :</h2>
              <p>
                Ce site peut utiliser des cookies pour améliorer l'expérience de l'utilisateur. 
                Pour en savoir plus sur l'utilisation des cookies, veuillez consulter notre politique en matière de cookies 
                en cliquant <a href="/confidentialite" className="text-blue-600 hover:underline">ici</a>.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Responsabilité :</h2>
              <p>
                L'éditeur s'efforce de fournir des informations exactes et à jour, mais ne peut garantir l'exactitude, 
                la pertinence ou l'exhaustivité des informations fournies sur ce site. L'utilisateur est seul responsable 
                de l'utilisation de ces informations.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Liens externes :</h2>
              <p>
                Ce site peut contenir des liens vers des sites web externes. L'éditeur n'est pas responsable du contenu 
                de ces sites externes ni des pratiques en matière de protection des données de ces sites.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Loi applicable :</h2>
              <p>
                Les présentes mentions légales sont régies par la législation belge relative à la navigation en ligne 
                et sa sécurité ainsi qu'au RGPD européen en vigueur à la date du jour de consultation, tout litige relatif 
                à ce site ou aux présentes législations sera soumis à la juridiction exclusive des tribunaux compétents 
                de Arlon (Prov. Luxembourgeoise) et sa division judiciaire.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">Contact :</h2>
              <p>
                Si vous avez des questions ou des préoccupations concernant ces mentions légales, 
                veuillez nous contacter à l'adresse suivante : info@politiquensemble.be
              </p>
            </div>
            
            <p className="text-sm text-gray-600 mt-10">Dernière mise à jour : 12 mars 2025</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LegalPage;