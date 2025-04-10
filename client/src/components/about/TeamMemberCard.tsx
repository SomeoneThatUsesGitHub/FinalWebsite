import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamMemberCardProps {
  name: string;
  title: string;
  bio: string;
  avatar: string | null;
  isAdmin?: boolean;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  title,
  bio,
  avatar,
  isAdmin = false,
}) => {
  // Fonction pour générer les initiales d'un nom
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
      <CardContent className="p-6 flex flex-col items-center text-center h-full">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border-2 border-gray-200">
            <AvatarImage src={avatar || undefined} alt={name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <Badge className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 px-2 py-0.5 text-xs">
              Admin
            </Badge>
          )}
        </div>
        <h3 className="font-bold text-lg text-dark mb-1">{name}</h3>
        {title && (
          <p className="text-blue-600 text-sm font-medium mb-3">{title}</p>
        )}
        {bio && (
          <p className="text-dark/70 text-sm line-clamp-4">{bio}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;