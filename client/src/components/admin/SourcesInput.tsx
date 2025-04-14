import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Source {
  url: string;
  name: string;
}

interface SourcesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourcesInput({ value, onChange }: SourcesInputProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [newSourceUrl, setNewSourceUrl] = useState<string>("");

  // Analyser la valeur initiale au montage du composant
  useEffect(() => {
    if (value) {
      try {
        // Essayer de parser comme JSON
        const parsedSources = JSON.parse(value);
        if (Array.isArray(parsedSources)) {
          setSources(parsedSources);
          return;
        }
      } catch (e) {
        // Si ce n'est pas du JSON valide, c'est peut-être un format ancien (texte simple)
        // Divisons par les retours à la ligne
        const textSources = value.split("\n").filter(Boolean);
        const formattedSources = textSources.map(url => ({
          url,
          name: extractNameFromUrl(url) || "Source"
        }));
        setSources(formattedSources);
      }
    }
  }, []);

  // Mettre à jour la valeur en sortie lorsque les sources changent
  useEffect(() => {
    if (sources.length > 0) {
      onChange(JSON.stringify(sources));
    } else {
      onChange("");
    }
  }, [sources, onChange]);

  // Fonction pour extraire le nom du média d'une URL
  const extractNameFromUrl = (url: string): string => {
    try {
      const hostname = new URL(url).hostname;
      
      // Supprimer www. et extraire le nom de domaine principal
      const domain = hostname.replace(/^www\./, "").split(".")[0];
      
      // Capitaliser la première lettre
      const name = domain.charAt(0).toUpperCase() + domain.slice(1);
      
      // Cas spéciaux pour les médias courants
      if (hostname.includes("lemonde.fr")) return "Le Monde";
      if (hostname.includes("lefigaro.fr")) return "Le Figaro";
      if (hostname.includes("liberation.fr")) return "Libération";
      if (hostname.includes("leparisien.fr")) return "Le Parisien";
      if (hostname.includes("lepoint.fr")) return "Le Point";
      if (hostname.includes("lexpress.fr")) return "L'Express";
      if (hostname.includes("nouvelobs.com")) return "L'Obs";
      if (hostname.includes("francetvinfo.fr")) return "France Info";
      if (hostname.includes("bfmtv.com")) return "BFMTV";
      if (hostname.includes("europe1.fr")) return "Europe 1";
      if (hostname.includes("rtl.fr")) return "RTL";
      if (hostname.includes("rfi.fr")) return "RFI";
      if (hostname.includes("france24.com")) return "France 24";
      if (hostname.includes("afp.com")) return "AFP";
      if (hostname.includes("reuters.com")) return "Reuters";
      
      return name || "Article";
    } catch (e) {
      return "Source";
    }
  };

  const addSource = () => {
    if (!newSourceUrl.trim()) return;
    
    try {
      // Vérifier si c'est une URL valide
      new URL(newSourceUrl);
      
      // Ajouter la source
      const name = extractNameFromUrl(newSourceUrl);
      setSources([...sources, { url: newSourceUrl, name }]);
      setNewSourceUrl("");
    } catch (e) {
      alert("Veuillez entrer une URL valide");
    }
  };

  const removeSource = (index: number) => {
    const newSources = [...sources];
    newSources.splice(index, 1);
    setSources(newSources);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="https://www.lemonde.fr/article/..."
          value={newSourceUrl}
          onChange={(e) => setNewSourceUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSource()}
        />
        <Button 
          type="button" 
          onClick={addSource}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {sources.map((source, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 pl-3">
              {source.name}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => removeSource(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}