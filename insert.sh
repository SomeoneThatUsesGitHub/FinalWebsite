#!/bin/bash

# Créer des fichiers temporaires
cp client/src/pages/admin/EditArticlePage.tsx temp1.tsx
cp client/src/pages/admin/EditArticlePage.tsx temp2.tsx

# Premier remplacement (premier formulaire) - aux alentours de la ligne 236
linenum1=$(grep -n "</div>" temp1.tsx | grep -A1 "imageUrl" | head -1 | cut -d: -f1)
nextlinenum1=$((linenum1+2))
sed -i "${nextlinenum1}i\\              <SourcesField form={form} />" temp1.tsx

# Deuxième remplacement (deuxième formulaire) - aux alentours de la ligne 600
linenum2=$(grep -n "</div>" temp2.tsx | grep -A1 "imageUrl" | tail -1 | cut -d: -f1)
nextlinenum2=$((linenum2+2))
sed -i "${nextlinenum2}i\\              <SourcesField form={form} />" temp2.tsx

# Combiner les changements
head -n $((linenum1+3)) temp1.tsx > combined.tsx
tail -n +$((linenum1+3)) temp2.tsx >> combined.tsx

# Remplacer le fichier original
mv combined.tsx client/src/pages/admin/EditArticlePage.tsx

# Nettoyer
rm temp1.tsx temp2.tsx
