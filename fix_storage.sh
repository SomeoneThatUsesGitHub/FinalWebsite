#!/bin/bash
cd /home/runner/workspace

# Créer une copie à partir de la sauvegarde
cp server/storage.ts.bak server/storage.ts

# Remplacement pour l'interface IStorage
sed -i '57,65s/getAllArticleSubmissions(): Promise<(ArticleSubmission & { \n    submitter?: { displayName: string }, \n    assignedEditor?: { displayName: string }\n  })[]>;/getAllArticleSubmissions(): Promise<ArticleSubmission[]>;/' server/storage.ts

sed -i '62,65s/getArticleSubmissionById(id: number): Promise<(ArticleSubmission & { \n    submitter?: { displayName: string }, \n    assignedEditor?: { displayName: string } \n  }) | undefined>;/getArticleSubmissionById(id: number): Promise<ArticleSubmission | undefined>;/' server/storage.ts

# Supprimer les doublons dans l'interface 
sed -i '167,179d' server/storage.ts

echo "Modifications terminées."