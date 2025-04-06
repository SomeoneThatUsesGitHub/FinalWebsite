import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  articles, type Article, type InsertArticle,
  newsUpdates, type NewsUpdate, type InsertNewsUpdate,
  elections, type Election, type InsertElection,
  educationalContent, type EducationalContent, type InsertEducationalContent
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Article operations
  getAllArticles(filters?: {categoryId?: number, search?: string, sort?: string}): Promise<Article[]>;
  getFeaturedArticles(limit?: number): Promise<Article[]>;
  getRecentArticles(limit?: number): Promise<Article[]>;
  getArticlesByCategory(categoryId: number, limit?: number): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticleViews(id: number): Promise<void>;
  
  // News Updates operations
  getActiveNewsUpdates(): Promise<NewsUpdate[]>;
  createNewsUpdate(newsUpdate: InsertNewsUpdate): Promise<NewsUpdate>;
  
  // Election operations
  getAllElections(): Promise<Election[]>;
  getUpcomingElections(limit?: number): Promise<Election[]>;
  getRecentElections(limit?: number): Promise<Election[]>;
  getElectionById(id: number): Promise<Election | undefined>;
  createElection(election: InsertElection): Promise<Election>;
  
  // Educational Content operations
  getAllEducationalContent(categoryId?: number): Promise<EducationalContent[]>;
  getEducationalContentById(id: number): Promise<EducationalContent | undefined>;
  createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private articles: Map<number, Article>;
  private newsUpdates: Map<number, NewsUpdate>;
  private elections: Map<number, Election>;
  private educationalContent: Map<number, EducationalContent>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentArticleId: number;
  private currentNewsUpdateId: number;
  private currentElectionId: number;
  private currentEducationalContentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.articles = new Map();
    this.newsUpdates = new Map();
    this.elections = new Map();
    this.educationalContent = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentArticleId = 1;
    this.currentNewsUpdateId = 1;
    this.currentElectionId = 1;
    this.currentEducationalContentId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample categories
    const categories = [
      { name: "Politique France", slug: "politique-france", color: "#FF4D4D" },
      { name: "International", slug: "international", color: "#3B82F6" },
      { name: "Économie", slug: "economie", color: "#F59E0B" },
      { name: "Environnement", slug: "environnement", color: "#10B981" },
      { name: "Société", slug: "societe", color: "#8B5CF6" },
      { name: "Tech & Politique", slug: "tech-politique", color: "#6366F1" }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Add sample user
    this.createUser({
      username: "admin",
      password: "admin123",
      displayName: "Admin User",
      role: "admin",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
    });
    
    // Add sample articles for each category
    const articleTemplates = [
      {
        title: "Les propositions économiques des candidats à la présidentielle 2024",
        slug: "propositions-economiques-presidentielle-2024",
        content: "Analyse détaillée des programmes économiques des principaux candidats et leur impact potentiel sur les jeunes.",
        excerpt: "Analyse des programmes économiques des principaux candidats et leur impact potentiel sur les jeunes.",
        imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
        authorId: 1,
        categoryId: 1,
        featured: true
      },
      {
        title: "Manifestation historique pour le climat à Paris",
        slug: "manifestation-historique-climat-paris",
        content: "Plus de 100 000 personnes se sont réunies à Paris pour demander des actions concrètes contre le changement climatique.",
        excerpt: "Plus de 100 000 personnes réunies à Paris pour demander des actions contre le changement climatique.",
        imageUrl: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 4,
        featured: true
      },
      {
        title: "L'UE adopte une réforme majeure sur l'immigration",
        slug: "ue-reforme-immigration",
        content: "Après des années de négociations, l'Union Européenne a enfin adopté une réforme majeure de sa politique d'immigration.",
        excerpt: "L'Union Européenne a adopté une réforme majeure de sa politique d'immigration après des années de négociations.",
        imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 2,
        featured: true
      }
    ];
    
    articleTemplates.forEach(article => {
      this.createArticle(article);
    });
    
    // Add more sample articles
    const moreArticles = [
      {
        title: "Éducation politique : faut-il l'introduire plus tôt dans les écoles ?",
        slug: "education-politique-ecoles",
        content: "Débat sur l'importance d'éduquer les jeunes citoyens aux enjeux politiques dès le collège.",
        excerpt: "Débat sur l'importance d'éduquer les jeunes citoyens aux enjeux politiques dès le collège.",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 5,
        viewCount: 1200,
        commentCount: 18
      },
      {
        title: "Les jeunes entrepreneurs au service d'une économie durable",
        slug: "jeunes-entrepreneurs-economie-durable",
        content: "Portrait de startups innovantes fondées par la nouvelle génération d'entrepreneurs engagés.",
        excerpt: "Portrait de startups innovantes fondées par la nouvelle génération d'entrepreneurs engagés.",
        imageUrl: "https://images.unsplash.com/photo-1607944024060-0450380ddd33?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80",
        authorId: 1,
        categoryId: 3,
        viewCount: 945,
        commentCount: 7
      },
      {
        title: "Comprendre les tensions internationales en 20 minutes",
        slug: "comprendre-tensions-internationales",
        content: "Thomas Legrand nous explique les enjeux géopolitiques actuels de façon simple et accessible.",
        excerpt: "Thomas Legrand nous explique les enjeux géopolitiques actuels de façon simple et accessible.",
        imageUrl: "",
        authorId: 1,
        categoryId: 2,
        viewCount: 763,
        commentCount: 12
      },
      {
        title: "Les réformes éducatives du nouveau gouvernement : ce qui va changer",
        slug: "reformes-educatives-nouveau-gouvernement",
        content: "Analyse détaillée des nouvelles mesures pour l'éducation nationale et leurs impacts pour les étudiants et professeurs.",
        excerpt: "Analyse détaillée des nouvelles mesures pour l'éducation nationale et leurs impacts pour les étudiants et professeurs.",
        imageUrl: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        authorId: 1,
        categoryId: 1
      },
      {
        title: "Abstention des jeunes : comment inverser la tendance ?",
        slug: "abstention-jeunes-inverser-tendance",
        content: "Les chiffres de l'abstention chez les 18-25 ans sont alarmants. Décryptage des solutions proposées pour remobiliser la jeunesse.",
        excerpt: "Les chiffres de l'abstention chez les 18-25 ans sont alarmants. Décryptage des solutions proposées pour remobiliser la jeunesse.",
        imageUrl: "https://images.unsplash.com/photo-1600693606196-86c2a0c9293c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 5
      },
      {
        title: "Rapport du GIEC : ce que les politiques doivent faire maintenant",
        slug: "rapport-giec-mesures-politiques",
        content: "Les scientifiques sont formels : il reste peu de temps pour agir. Quelles sont les mesures urgentes que nos dirigeants devraient prendre ?",
        excerpt: "Les scientifiques sont formels : il reste peu de temps pour agir. Quelles sont les mesures urgentes que nos dirigeants devraient prendre ?",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 4
      },
      {
        title: "Les défis de la transition énergétique en Europe",
        slug: "defis-transition-energetique-europe",
        content: "Analyse des différentes stratégies adoptées par les pays européens pour atteindre la neutralité carbone.",
        excerpt: "Analyse des différentes stratégies adoptées par les pays européens pour atteindre la neutralité carbone.",
        imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 2,
        categoryId: 2
      },
      {
        title: "La crise des réfugiés : nouveaux développements",
        slug: "crise-refugies-nouveaux-developpements",
        content: "Point sur la situation des réfugiés en Europe et les politiques d'accueil des différents pays membres.",
        excerpt: "Point sur la situation des réfugiés en Europe et les politiques d'accueil des différents pays membres.",
        imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 3,
        categoryId: 2
      },
      {
        title: "Nouvelles tensions diplomatiques au Moyen-Orient",
        slug: "tensions-diplomatiques-moyen-orient",
        content: "Analyse des récentes tensions entre grandes puissances et leur impact sur la stabilité régionale.",
        excerpt: "Analyse des récentes tensions entre grandes puissances et leur impact sur la stabilité régionale.",
        imageUrl: "https://images.unsplash.com/photo-1589262804704-c5aa9e6def89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        authorId: 2,
        categoryId: 4
      },
      {
        title: "La réforme fiscale : gagnants et perdants",
        slug: "reforme-fiscale-gagnants-perdants",
        content: "Décryptage des nouvelles mesures fiscales et leurs impacts sur les différentes catégories de contribuables.",
        excerpt: "Décryptage des nouvelles mesures fiscales et leurs impacts sur les différentes catégories de contribuables.",
        imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 3
      },
      {
        title: "L'avenir des médias traditionnels face au numérique",
        slug: "avenir-medias-traditionnels-numerique",
        content: "Comment les journaux et chaînes de télévision s'adaptent-ils face à la montée en puissance des plateformes numériques ?",
        excerpt: "Comment les journaux et chaînes de télévision s'adaptent-ils face à la montée en puissance des plateformes numériques ?",
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 3,
        categoryId: 5
      }
    ];
    
    moreArticles.forEach(article => {
      this.createArticle(article);
    });
    
    // Add news updates for ticker
    const newsUpdateSamples = [
      {
        title: "Elections présidentielles : les derniers sondages montrent une tendance inattendue",
        icon: "🇫🇷",
        active: true
      },
      {
        title: "Le Parlement européen adopte une nouvelle directive sur le climat",
        icon: "🇪🇺",
        active: true
      },
      {
        title: "Inflation : quelles mesures pour protéger le pouvoir d'achat ?",
        icon: "📊",
        active: true
      }
    ];
    
    newsUpdateSamples.forEach(update => {
      this.createNewsUpdate(update);
    });
    
    // Add election data
    const electionSamples = [
      {
        country: "France",
        countryCode: "fr",
        title: "Élections législatives 2023",
        date: new Date("2023-06-18"),
        type: "legislative",
        results: [
          { party: "Parti A", percentage: 34, color: "#0D47A1" },
          { party: "Parti B", percentage: 28, color: "#E53935" },
          { party: "Parti C", percentage: 18, color: "#2E7D32" },
          { party: "Parti D", percentage: 13, color: "#FFC107" },
          { party: "Autres", percentage: 7, color: "#757575" }
        ],
        description: "Résultats des élections législatives françaises de 2023."
      },
      {
        country: "Allemagne",
        countryCode: "de",
        title: "Élections fédérales 2023",
        date: new Date("2023-09-25"),
        type: "federal",
        results: [
          { party: "Parti A", percentage: 30, color: "#E53935" },
          { party: "Parti B", percentage: 25, color: "#000000" },
          { party: "Parti C", percentage: 20, color: "#2E7D32" },
          { party: "Parti D", percentage: 10, color: "#FFC107" },
          { party: "Autres", percentage: 15, color: "#757575" }
        ],
        description: "Résultats des élections fédérales allemandes de 2023."
      },
      {
        country: "France",
        countryCode: "fr",
        title: "Élections présidentielles",
        date: new Date("2024-04-15"),
        type: "presidential",
        results: [],
        description: "Prochaines élections présidentielles en France.",
        upcoming: true
      },
      {
        country: "Royaume-Uni",
        countryCode: "gb",
        title: "Élections générales",
        date: new Date("2024-01-15"),
        type: "general",
        results: [],
        description: "Prochaines élections générales au Royaume-Uni.",
        upcoming: true
      },
      {
        country: "Union Européenne",
        countryCode: "eu",
        title: "Élections parlementaires",
        date: new Date("2024-06-09"),
        type: "parliament",
        results: [],
        description: "Prochaines élections du Parlement européen.",
        upcoming: true
      },
      {
        country: "États-Unis",
        countryCode: "us",
        title: "Élections présidentielles",
        date: new Date("2024-11-05"),
        type: "presidential",
        results: [],
        description: "Prochaines élections présidentielles aux États-Unis.",
        upcoming: true
      }
    ];
    
    electionSamples.forEach(election => {
      this.createElection(election);
    });
    
    // Add educational content
    const educationalContentSamples = [
      {
        title: "Les institutions françaises : rôles et fonctionnement",
        imageUrl: "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        content: "Tout ce que vous devez savoir sur les institutions françaises et leur fonctionnement.",
        categoryId: 1,
        likes: 1200,
        comments: 78
      },
      {
        title: "L'Union Européenne : comprendre son fonctionnement en 5 points",
        imageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        content: "Les 5 points clés pour comprendre comment fonctionne l'Union Européenne.",
        categoryId: 2,
        likes: 956,
        comments: 42
      },
      {
        title: "Histoire du droit de vote en France : les grandes étapes",
        imageUrl: "https://images.unsplash.com/photo-1469920783271-4ee08a94d42d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        content: "De la Révolution française à nos jours, retour sur l'évolution du droit de vote en France.",
        categoryId: 1,
        likes: 873,
        comments: 36
      },
      {
        title: "Le budget de l'État expliqué simplement",
        imageUrl: "https://images.unsplash.com/photo-1445295029071-5151176738d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1999&q=80",
        content: "Comment fonctionne le budget de l'État et comment est-il réparti ?",
        categoryId: 3,
        likes: 1500,
        comments: 93
      },
      {
        title: "Accords de Paris : enjeux et limites de la lutte climatique",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        content: "Tout comprendre sur les Accords de Paris et leurs implications pour la lutte contre le changement climatique.",
        categoryId: 4,
        likes: 1100,
        comments: 54
      },
      {
        title: "Le système éducatif français : organisation et défis",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        content: "Comment est organisé le système éducatif français et quels sont les défis auxquels il fait face ?",
        categoryId: 5,
        likes: 987,
        comments: 41
      },
      {
        title: "L'économie française en chiffres : forces et faiblesses",
        imageUrl: "https://images.unsplash.com/photo-1525498128493-380d1990a112?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2035&q=80",
        content: "Les chiffres clés de l'économie française et analyse de ses forces et faiblesses.",
        categoryId: 3,
        likes: 842,
        comments: 29
      },
      {
        title: "Nations Unies : son rôle dans la diplomatie mondiale",
        imageUrl: "https://images.unsplash.com/photo-1572204292164-b35ba943fca7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        content: "Découvrez le rôle et le fonctionnement des Nations Unies dans la diplomatie internationale.",
        categoryId: 2,
        likes: 763,
        comments: 27
      }
    ];
    
    educationalContentSamples.forEach(content => {
      this.createEducationalContent(content);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Article operations
  async getAllArticles(filters?: {categoryId?: number, search?: string, sort?: string}): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    // Apply filters
    if (filters) {
      // Filter by category
      if (filters.categoryId) {
        articles = articles.filter(article => article.categoryId === filters.categoryId);
      }
      
      // Filter by search term
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        articles = articles.filter(article => 
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort articles
      if (filters.sort) {
        switch (filters.sort) {
          case 'recent':
            articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'popular':
            articles.sort((a, b) => b.viewCount - a.viewCount);
            break;
          case 'commented':
            articles.sort((a, b) => b.commentCount - a.commentCount);
            break;
        }
      } else {
        // Default sort by recency
        articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      // Default sort by recency
      articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return articles;
  }
  
  async getFeaturedArticles(limit: number = 3): Promise<Article[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.featured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? articles.slice(0, limit) : articles;
  }
  
  async getRecentArticles(limit: number = 6): Promise<Article[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.published)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? articles.slice(0, limit) : articles;
  }
  
  async getArticlesByCategory(categoryId: number, limit: number = 6): Promise<Article[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.published && article.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? articles.slice(0, limit) : articles;
  }
  
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.slug === slug
    );
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const now = new Date();
    const article: Article = { 
      ...insertArticle, 
      id,
      viewCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.articles.set(id, article);
    return article;
  }
  
  async updateArticleViews(id: number): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.viewCount++;
      this.articles.set(id, article);
    }
  }
  
  // News Updates operations
  async getActiveNewsUpdates(): Promise<NewsUpdate[]> {
    return Array.from(this.newsUpdates.values())
      .filter(update => update.active)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createNewsUpdate(insertNewsUpdate: InsertNewsUpdate): Promise<NewsUpdate> {
    const id = this.currentNewsUpdateId++;
    const now = new Date();
    const newsUpdate: NewsUpdate = { 
      ...insertNewsUpdate, 
      id,
      createdAt: now
    };
    this.newsUpdates.set(id, newsUpdate);
    return newsUpdate;
  }
  
  // Election operations
  async getAllElections(): Promise<Election[]> {
    return Array.from(this.elections.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getUpcomingElections(limit: number = 4): Promise<Election[]> {
    const now = new Date();
    const elections = Array.from(this.elections.values())
      .filter(election => election.upcoming && new Date(election.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return limit ? elections.slice(0, limit) : elections;
  }
  
  async getRecentElections(limit: number = 2): Promise<Election[]> {
    const now = new Date();
    const elections = Array.from(this.elections.values())
      .filter(election => !election.upcoming && new Date(election.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? elections.slice(0, limit) : elections;
  }
  
  async getElectionById(id: number): Promise<Election | undefined> {
    return this.elections.get(id);
  }
  
  async createElection(insertElection: InsertElection): Promise<Election> {
    const id = this.currentElectionId++;
    const now = new Date();
    const election: Election = { 
      ...insertElection, 
      id,
      createdAt: now
    };
    this.elections.set(id, election);
    return election;
  }
  
  // Educational Content operations
  async getAllEducationalContent(categoryId?: number): Promise<EducationalContent[]> {
    let content = Array.from(this.educationalContent.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (categoryId) {
      content = content.filter(item => item.categoryId === categoryId);
    }
    
    return content;
  }
  
  async getEducationalContentById(id: number): Promise<EducationalContent | undefined> {
    return this.educationalContent.get(id);
  }
  
  async createEducationalContent(insertContent: InsertEducationalContent): Promise<EducationalContent> {
    const id = this.currentEducationalContentId++;
    const now = new Date();
    const content: EducationalContent = { 
      ...insertContent, 
      id,
      likes: 0,
      comments: 0,
      createdAt: now
    };
    this.educationalContent.set(id, content);
    return content;
  }
}

export const storage = new MemStorage();
