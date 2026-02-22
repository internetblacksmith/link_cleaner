class TrackerConstants {
  static const Set<String> commonTrackers = {
    // Google Analytics
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'utm_id', 'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic',
    
    // Facebook
    'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source', 'fb_ref',
    
    // Google Ads
    'gclid', 'gclsrc', 'gbraid', 'wbraid',
    
    // Microsoft
    'msclkid',
    
    // Twitter
    'twclid',
    
    // TikTok
    'ttclid',
    
    // Pinterest
    'epik',
    
    // Snapchat
    'ScCid',
    
    // General tracking
    'ref', 'referrer', 'source', 'campaign', 'ad', 'adgroup', 'creative',
    'keyword', 'placement', 'network', 'device', 'target', 'feeditemid',
    'targetid', 'loc_interest_ms', 'loc_physical_ms', 'matchtype',
    'adposition', 'sourceid', 'ie', 'f', 'sxsrf', 'ei', 'ved',
    
    // Adobe/Omniture
    's_cid', 's_kwcid',
    
    // Mailchimp
    'mc_cid', 'mc_eid',
    
    // Marketo
    'mkt_tok', 'trk', 'trkInfo', 'mkwid', 'pcrid',
    
    // HubSpot
    '__hstc', '__hssc', '__hsfp', 'hsCtaTracking', '__htka',
    
    // Analytics
    '_ga', '_gid', '_gat', '_gac',
    
    // Email tracking
    'email_id', 'emailid', 'emid', 'eid',
    
    // Amazon
    'tag', 'linkCode', 'camp',
    
    // Other
    'redirect_log_mongo_id', 'redirect_mongo_id', 'sb_referer_host',
    'tracking_id', 'trackingid', 'affid', 'affiliate_id', 'ref_id',
    'refID', 'referral_code', 'session_id', 'sid',
  };
  
  static const Map<String, String> trackerCategories = {
    'utm_source': 'Google Analytics',
    'utm_medium': 'Google Analytics',
    'utm_campaign': 'Google Analytics',
    'utm_term': 'Google Analytics',
    'utm_content': 'Google Analytics',
    'fbclid': 'Facebook',
    'gclid': 'Google Ads',
    'msclkid': 'Microsoft',
    'twclid': 'Twitter',
    'ttclid': 'TikTok',
    'mc_cid': 'Mailchimp',
    'mc_eid': 'Mailchimp',
    '__hstc': 'HubSpot',
    '__hssc': 'HubSpot',
    '__hsfp': 'HubSpot',
    '_ga': 'Google Analytics',
    '_gid': 'Google Analytics',
  };
}