import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface SourcesFieldProps {
  form: UseFormReturn<any>;
}

export function SourcesField({ form }: SourcesFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sources">Sources consultées</Label>
      <Textarea
        id="sources"
        placeholder="Par exemple: Le Monde (https://www.lemonde.fr/article), INSEE (https://www.insee.fr/donnees)..."
        rows={3}
        {...form.register("sources")}
      />
      <p className="text-xs text-muted-foreground">
        Ces sources seront affichées en bas de l'article. Séparez chaque source par une nouvelle ligne.
      </p>
      {form.formState.errors.sources && (
        <p className="text-sm text-red-500">{form.formState.errors.sources.message}</p>
      )}
    </div>
  );
}