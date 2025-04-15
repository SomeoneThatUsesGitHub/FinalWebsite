#!/bin/bash

# Recherche et remplace toutes les occurrences de politiquensemble.fr par politiquensemble.be
# dans les fichiers TypeScript et TSX

echo "Remplacement des occurrences de politiquensemble.fr par politiquensemble.be..."

# Nombres d'occurrences avant remplacement
before=$(grep -r "politiquensemble.fr" --include="*.ts" --include="*.tsx" . | wc -l)
echo "Occurrences trouvées avant remplacement: $before"

# Effectue le remplacement de manière sécurisée avec sed
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/politiquensemble\.fr/politiquensemble.be/g' {} \;

# Nombres d'occurrences après remplacement
after=$(grep -r "politiquensemble.fr" --include="*.ts" --include="*.tsx" . | wc -l)
echo "Occurrences restantes après remplacement: $after"
echo "Nombre de remplacements effectués: $((before - after))"

echo "Opération terminée."