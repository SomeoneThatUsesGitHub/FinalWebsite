import { useState, useEffect } from "react";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TestEditorPage() {
  const [content, setContent] = useState<string>("<p>Contenu initial de test...</p>");
  const [previewHtml, setPreviewHtml] = useState<string>(content);
  const [editorKey, setEditorKey] = useState<number>(0); // Pour forcer la réinitialisation
  
  // Synchroniser la prévisualisation avec le contenu
  useEffect(() => {
    setPreviewHtml(content);
  }, [content]);
  
  // Modifier manuellement le contenu
  const handleContentChange = (newContent: string) => {
    console.log("Mise à jour du contenu:", {
      previous_length: content.length,
      new_length: newContent.length,
      same: content === newContent,
    });
    setContent(newContent);
  };
  
  // Réinitialiser l'éditeur avec un nouveau contenu
  const resetEditor = () => {
    const testContent = `<h2>Contenu de test [${new Date().toLocaleTimeString()}]</h2>
<p>Ceci est un paragraphe avec du <strong>texte en gras</strong> et de l'<em>italique</em>.</p>
<ul>
  <li>Élément de liste 1</li>
  <li>Élément de liste 2</li>
</ul>
<p>Un autre paragraphe avec un <a href="https://example.com">lien</a>.</p>`;
    
    setContent(testContent);
    setEditorKey(prev => prev + 1); // Changer la clé pour forcer le remontage
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Test de l'éditeur riche</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations de débogage</CardTitle>
          <CardDescription>
            Métriques et état actuel de l'éditeur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Label>Longueur du contenu:</Label>
              <p className="font-mono bg-muted p-1 rounded text-sm">{content.length} caractères</p>
            </div>
            <div>
              <Label>Contenu brut:</Label>
              <div className="font-mono bg-muted p-2 rounded text-sm overflow-auto max-h-24">
                {content}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={resetEditor} variant="secondary">
              Réinitialiser avec contenu de test
            </Button>
            <Button 
              onClick={() => setContent("")} 
              variant="outline"
            >
              Vider le contenu
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Éditeur (instance #{editorKey})</CardTitle>
            <CardDescription>
              Testez l'éditeur de texte riche ici
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              key={`editor-${editorKey}`}
              value={content}
              onChange={handleContentChange}
              placeholder="Commencez à rédiger..."
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation</CardTitle>
            <CardDescription>
              Résultat HTML rendu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-4 min-h-[300px] prose max-w-none">
              {previewHtml ? (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <p className="text-muted-foreground text-center py-10">
                  Le contenu s'affichera ici lorsque vous commencerez à écrire.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}