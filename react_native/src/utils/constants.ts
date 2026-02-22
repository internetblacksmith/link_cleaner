export const COMMON_TRACKERS = [
  // Google Analytics
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_source_platform',
  'utm_creative_format',
  'utm_marketing_tactic',
  
  // Facebook
  'fbclid',
  'fb_action_ids',
  'fb_action_types',
  'fb_source',
  'fb_ref',
  
  // Google Ads
  'gclid',
  'gclsrc',
  'gbraid',
  'wbraid',
  
  // Microsoft
  'msclkid',
  
  // General tracking
  'ref',
  'referrer',
  'source',
  'campaign',
  'ad',
  'adgroup',
  'creative',
  'keyword',
  'placement',
  'network',
  'device',
  'target',
  'feeditemid',
  'targetid',
  'loc_interest_ms',
  'loc_physical_ms',
  'matchtype',
  'adposition',
  'sourceid',
  
  // Adobe/Omniture
  's_cid',
  's_kwcid',
  
  // Mailchimp
  'mc_cid',
  'mc_eid',
  
  // Marketo
  'mkt_tok',
  'trk',
  'trkInfo',
  
  // Klaviyo
  '_ke',
  
  // HubSpot
  '__hstc',
  '__hssc',
  '__hsfp',
  'hsCtaTracking',
  '__htka',
  
  // Olytics
  'oly_enc_id',
  'oly_anon_id',
  
  // Vero
  'vero_id',
  'vero_conv',
  
  // Marketo
  'mkwid',
  'pcrid',
  
  // Adobe Analytics
  'ef_id',
  's_kwcid',
  
  // Twitter
  'twclid',
  
  // TikTok
  'ttclid',
  
  // Pinterest
  'epik',
  
  // Snapchat
  'ScCid',
  
  // Amazon
  'tag',
  'linkCode',
  'camp',
  'creative',
  
  // Reddit
  'reddit_ad_id',
  
  // Generic tracking
  'tracking_id',
  'trackingid',
  'affid',
  'affiliate_id',
  'ref_id',
  'refID',
  'referral_code',
  'session_id',
  'sid',
  '_ga',
  '_gid',
  '_gat',
  '_gac',
  
  // Email tracking
  'email_id',
  'emailid',
  'emid',
  'eid',
  
  // Other common parameters
  'redirect_log_mongo_id',
  'redirect_mongo_id',
  'sb_referer_host',
  'ie',
  'f',
  'sxsrf',
  'ei',
  'ved',
] as const;

export const APP_CONFIG = {
  APP_NAME: 'Link Cleaner',
  BUNDLE_ID: {
    IOS: 'com.yourcompany.linkcleaner',
    ANDROID: 'com.yourcompany.linkcleaner',
  },
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
} as const;

export const COLORS = {
  primary: '#007AFF',
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
  },
  border: '#E0E0E0',
} as const;