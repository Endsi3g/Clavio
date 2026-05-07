export type Locale = 'en' | 'fr'

export const dictionaries = {
  en: {
    dashboard: {
      title: 'Dashboard',
      greeting: 'Hello, Creator 👋',
      subtitle: "Here's what's going on in your workspace today.",
      thingsToDo: 'Things to do',
      upcomingPosts: 'Upcoming scheduled posts',
      recentActivity: 'Recent activity',
      workspaceStatus: 'Workspace status',
      performance: 'Performance',
      byPlatform: 'By platform',
      quickActions: 'Quick actions',
      viewAll: 'View all',
      noPosts: 'No posts scheduled yet.',
      noActivity: 'No recent activity logged.',
    },
    topbar: {
      search: 'Search the workspace...',
      searchMobile: 'Search...',
    },
    sidebar: {
      workspace: 'Workspace',
      contentEngine: 'Content Engine',
      resources: 'Resources',
      system: 'System',
    }
  },
  fr: {
    dashboard: {
      title: 'Tableau de bord',
      greeting: 'Bonjour, Créateur 👋',
      subtitle: "Voici ce qui se passe dans votre espace de travail aujourd'hui.",
      thingsToDo: 'À faire',
      upcomingPosts: 'Publications programmées à venir',
      recentActivity: 'Activité récente',
      workspaceStatus: "Statut de l'espace",
      performance: 'Performances',
      byPlatform: 'Par plateforme',
      quickActions: 'Actions rapides',
      viewAll: 'Voir tout',
      noPosts: 'Aucune publication programmée.',
      noActivity: 'Aucune activité récente.',
    },
    topbar: {
      search: "Rechercher dans l'espace...",
      searchMobile: 'Recherche...',
    },
    sidebar: {
      workspace: 'Espace de travail',
      contentEngine: 'Moteur de contenu',
      resources: 'Ressources',
      system: 'Système',
    }
  }
}

export type Dictionary = typeof dictionaries.en
