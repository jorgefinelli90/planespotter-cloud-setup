/**
 * News types and interfaces
 * Manages aviation news feed and articles
 */

/**
 * News article
 */
export interface NewsArticle {
  /** Unique article identifier */
  id: string
  /** Article title */
  title: string
  /** Article summary/preview */
  summary: string
  /** Full article content (HTML or markdown) */
  content?: string
  /** Article category */
  category:
    | 'aviation'
    | 'airline'
    | 'aircraft'
    | 'airport'
    | 'incident'
    | 'maintenance'
    | 'technology'
    | 'other'
  /** Source name */
  source: string
  /** Source URL */
  sourceUrl: string
  /** Article author (if available) */
  author?: string
  /** Publication date (ISO 8601) */
  publishedAt: string
  /** Article thumbnail/image URL */
  imageUrl?: string
  /** Tags/keywords */
  tags?: string[]
  /** Related aircraft IDs (if applicable) */
  relatedAircraft?: string[]
  /** Related airline codes (if applicable) */
  relatedAirlines?: string[]
  /** Sentiment: 'positive', 'neutral', 'negative' */
  sentiment?: 'positive' | 'neutral' | 'negative'
  /** Relevance score (0-100) */
  relevanceScore?: number
  /** Article is marked as read */
  isRead?: boolean
  /** Article is bookmarked/saved */
  isBookmarked?: boolean
  /** Date imported/fetched (ISO 8601) */
  importedAt: string
}

/**
 * News feed source
 */
export interface NewsSource {
  /** Source identifier */
  id: string
  /** Source name */
  name: string
  /** Source description */
  description?: string
  /** Source URL/RSS feed URL */
  url: string
  /** Source category */
  category: string
  /** Whether source is enabled */
  isEnabled: boolean
  /** Update frequency in minutes */
  updateFrequency: number
  /** Last fetched timestamp (ISO 8601) */
  lastFetched?: string
  /** Number of articles fetched */
  articleCount: number
  /** Source logo/icon URL */
  iconUrl?: string
  /** Custom tags for this source */
  tags?: string[]
  /** Added timestamp (ISO 8601) */
  addedAt: string
}

/**
 * News subscription/feed
 */
export interface NewsFeed {
  /** Feed identifier */
  id: string
  /** User ID */
  userId: string
  /** Feed name */
  name: string
  /** Feed description */
  description?: string
  /** Filter by categories */
  categories?: string[]
  /** Filter by tags */
  tags?: string[]
  /** Filter by keywords */
  keywords?: string[]
  /** Subscribed news sources */
  sources?: string[]
  /** Exclude keywords */
  excludeKeywords?: string[]
  /** Sort order: 'date', 'relevance', 'source' */
  sortBy: 'date' | 'relevance' | 'source'
  /** Articles per page */
  articlesPerPage: number
  /** Enable notifications for new articles */
  enableNotifications: boolean
  /** Notification frequency: 'instant', 'hourly', 'daily' */
  notificationFrequency: 'instant' | 'hourly' | 'daily'
  /** Feed is active */
  isActive: boolean
  /** Created timestamp (ISO 8601) */
  createdAt: string
  /** Updated timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * Saved article/bookmark
 */
export interface SavedArticle {
  /** Unique save identifier */
  id: string
  /** User ID */
  userId: string
  /** Article ID */
  articleId: string
  /** Custom note/annotation */
  note?: string
  /** Custom tags for this save */
  tags?: string[]
  /** Save collection/folder */
  collection?: string
  /** Priority: 'low', 'medium', 'high' */
  priority?: 'low' | 'medium' | 'high'
  /** Saved timestamp (ISO 8601) */
  savedAt: string
}

/**
 * News notification preference
 */
export interface NewsNotificationPreference {
  /** User ID */
  userId: string
  /** Enable notifications */
  enabled: boolean
  /** Notification frequency */
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly'
  /** Preferred notification method: 'email', 'in_app', 'both' */
  method: 'email' | 'in_app' | 'both'
  /** Categories to notify about */
  categories?: string[]
  /** Sources to notify about */
  sources?: string[]
  /** Minimum relevance score (0-100) */
  minRelevanceScore?: number
  /** Quiet hours start (HH:MM format) */
  quietHoursStart?: string
  /** Quiet hours end (HH:MM format) */
  quietHoursEnd?: string
  /** Updated timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * News analytics data
 */
export interface NewsAnalytics {
  /** Date (ISO 8601) */
  date: string
  /** Total articles published */
  totalArticles: number
  /** Articles by category */
  byCategory: Record<string, number>
  /** Articles by source */
  bySource: Record<string, number>
  /** Popular keywords */
  topKeywords: Array<{
    /** Keyword */
    keyword: string
    /** Occurrence count */
    count: number
  }>
  /** Average sentiment score */
  avgSentiment: number
  /** User engagement metrics */
  engagement: {
    /** Total articles read */
    articlesRead: number
    /** Total articles bookmarked */
    articlesBookmarked: number
    /** Average read time in seconds */
    avgReadTime: number
  }
}
