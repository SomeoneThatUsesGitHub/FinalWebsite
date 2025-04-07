import { createUser, updateUserPassword, listUsers, deleteUser } from "../server/userManagement";

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command) {
    console.log(`
Usage: 
  tsx scripts/add-user.ts add <username> <password> <displayName> <role>
  tsx scripts/add-user.ts update-password <username> <newPassword>
  tsx scripts/add-user.ts list
  tsx scripts/add-user.ts delete <username>

Examples:
  tsx scripts/add-user.ts add johndoe Password123! "John Doe" editor
  tsx scripts/add-user.ts update-password johndoe NewPassword123!
  tsx scripts/add-user.ts list
  tsx scripts/add-user.ts delete johndoe
    `);
    process.exit(1);
  }

  switch (command) {
    case 'add':
      if (args.length < 5) {
        console.error("Arguments insuffisants pour ajouter un utilisateur");
        process.exit(1);
      }
      
      const username = args[1];
      const password = args[2];
      const displayName = args[3];
      const role = args[4] as "admin" | "editor" | "user";
      
      if (!['admin', 'editor', 'user'].includes(role)) {
        console.error("Le rôle doit être 'admin', 'editor' ou 'user'");
        process.exit(1);
      }
      
      const result = await createUser({
        username,
        password,
        displayName,
        role
      });
      
      console.log(JSON.stringify(result, null, 2));
      break;
      
    case 'update-password':
      if (args.length < 3) {
        console.error("Arguments insuffisants pour mettre à jour un mot de passe");
        process.exit(1);
      }
      
      const usernameToUpdate = args[1];
      const newPassword = args[2];
      
      const updateResult = await updateUserPassword(usernameToUpdate, newPassword);
      console.log(JSON.stringify(updateResult, null, 2));
      break;
      
    case 'list':
      const listResult = await listUsers();
      console.log(JSON.stringify(listResult, null, 2));
      break;
      
    case 'delete':
      if (args.length < 2) {
        console.error("Argument manquant: nom d'utilisateur à supprimer");
        process.exit(1);
      }
      
      const usernameToDelete = args[1];
      const deleteResult = await deleteUser(usernameToDelete);
      
      console.log(JSON.stringify(deleteResult, null, 2));
      break;
      
    default:
      console.error("Commande inconnue:", command);
      process.exit(1);
  }
}

main().catch(error => {
  console.error("Erreur:", error);
  process.exit(1);
});