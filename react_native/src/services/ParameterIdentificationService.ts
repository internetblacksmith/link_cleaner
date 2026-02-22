import { ParameterDefinitionsUpdateService } from './ParameterDefinitionsUpdateService';

export interface ParameterInfo {
  name: string;
  description: string;
  category: 'tracking' | 'campaign' | 'analytics' | 'social' | 'technical' | 'unknown';
  isTracker: boolean;
}

export class ParameterIdentificationService {
  private static parameterDefinitions: Record<string, ParameterInfo> = {
    // YouTube parameters
    si: {
      name: 'Share ID',
      description: 'YouTube share tracking identifier',
      category: 'tracking',
      isTracker: true,
    },
    feature: {
      name: 'Share Source',
      description: 'Where the video was shared from',
      category: 'social',
      isTracker: true,
    },
    t: {
      name: 'Timestamp',
      description: 'Video start time in seconds',
      category: 'technical',
      isTracker: false,
    },
    list: {
      name: 'Playlist ID',
      description: 'YouTube playlist identifier',
      category: 'technical',
      isTracker: false,
    },
    index: {
      name: 'Playlist Index',
      description: 'Position in playlist',
      category: 'technical',
      isTracker: false,
    },
    
    // Amazon parameters
    ref: {
      name: 'Referrer',
      description: 'Amazon referral source',
      category: 'tracking',
      isTracker: true,
    },
    psc: {
      name: 'Product Search Click',
      description: 'Amazon search result tracking',
      category: 'tracking',
      isTracker: true,
    },
    pd_rd_i: {
      name: 'Product ID',
      description: 'Product recommendation ID',
      category: 'tracking',
      isTracker: true,
    },
    pd_rd_r: {
      name: 'Recommendation Request',
      description: 'Recommendation tracking ID',
      category: 'tracking',
      isTracker: true,
    },
    pd_rd_w: {
      name: 'Widget ID',
      description: 'Recommendation widget ID',
      category: 'tracking',
      isTracker: true,
    },
    pd_rd_wg: {
      name: 'Widget Group',
      description: 'Recommendation widget group',
      category: 'tracking',
      isTracker: true,
    },
    pf_rd_i: {
      name: 'Page Feature ID',
      description: 'Page feature tracking',
      category: 'tracking',
      isTracker: true,
    },
    pf_rd_m: {
      name: 'Merchant ID',
      description: 'Merchant tracking code',
      category: 'tracking',
      isTracker: true,
    },
    pf_rd_p: {
      name: 'Page ID',
      description: 'Page tracking identifier',
      category: 'tracking',
      isTracker: true,
    },
    pf_rd_r: {
      name: 'Request ID',
      description: 'Page request tracking',
      category: 'tracking',
      isTracker: true,
    },
    pf_rd_s: {
      name: 'Slot ID',
      description: 'Page slot tracking',
      category: 'tracking',
      isTracker: true,
    },
    pf_rd_t: {
      name: 'Page Type',
      description: 'Type of Amazon page',
      category: 'tracking',
      isTracker: true,
    },
    qid: {
      name: 'Query ID',
      description: 'Search query identifier',
      category: 'tracking',
      isTracker: true,
    },
    
    // Google/UTM Campaign parameters
    utm_source: {
      name: 'Campaign Source',
      description: 'Identifies traffic source (e.g., google, newsletter)',
      category: 'campaign',
      isTracker: true,
    },
    utm_medium: {
      name: 'Campaign Medium',
      description: 'Marketing medium (e.g., email, cpc, social)',
      category: 'campaign',
      isTracker: true,
    },
    utm_campaign: {
      name: 'Campaign Name',
      description: 'Specific campaign name',
      category: 'campaign',
      isTracker: true,
    },
    utm_term: {
      name: 'Campaign Term',
      description: 'Paid search keywords',
      category: 'campaign',
      isTracker: true,
    },
    utm_content: {
      name: 'Campaign Content',
      description: 'Differentiates similar content/links',
      category: 'campaign',
      isTracker: true,
    },
    utm_id: {
      name: 'Campaign ID',
      description: 'Google Ads campaign ID',
      category: 'campaign',
      isTracker: true,
    },
    
    // Facebook/Meta parameters
    fbclid: {
      name: 'Facebook Click ID',
      description: 'Facebook click tracking',
      category: 'social',
      isTracker: true,
    },
    fb_action_ids: {
      name: 'Facebook Action IDs',
      description: 'Facebook action tracking',
      category: 'social',
      isTracker: true,
    },
    fb_action_types: {
      name: 'Facebook Action Types',
      description: 'Type of Facebook action',
      category: 'social',
      isTracker: true,
    },
    fb_source: {
      name: 'Facebook Source',
      description: 'Facebook traffic source',
      category: 'social',
      isTracker: true,
    },
    
    // Twitter/X parameters
    twclid: {
      name: 'Twitter Click ID',
      description: 'Twitter click tracking',
      category: 'social',
      isTracker: true,
    },
    
    // Google Ads parameters
    gclid: {
      name: 'Google Click ID',
      description: 'Google Ads click tracking',
      category: 'tracking',
      isTracker: true,
    },
    gclsrc: {
      name: 'Google Click Source',
      description: 'Google click source identifier',
      category: 'tracking',
      isTracker: true,
    },
    
    // General tracking parameters
    _ga: {
      name: 'Google Analytics ID',
      description: 'Google Analytics client ID',
      category: 'analytics',
      isTracker: true,
    },
    _gid: {
      name: 'GA Session ID',
      description: 'Google Analytics session ID',
      category: 'analytics',
      isTracker: true,
    },
    _gl: {
      name: 'Google Linker',
      description: 'Cross-domain tracking',
      category: 'analytics',
      isTracker: true,
    },
    
    // Email tracking
    mc_cid: {
      name: 'Mailchimp Campaign',
      description: 'Mailchimp campaign ID',
      category: 'campaign',
      isTracker: true,
    },
    mc_eid: {
      name: 'Mailchimp Email ID',
      description: 'Mailchimp email tracking',
      category: 'campaign',
      isTracker: true,
    },
    
    // Other common parameters
    source: {
      name: 'Source',
      description: 'General source parameter',
      category: 'tracking',
      isTracker: true,
    },
    ref_: {
      name: 'Referrer',
      description: 'General referrer tracking',
      category: 'tracking',
      isTracker: true,
    },
    referrer: {
      name: 'Referrer',
      description: 'Referring website',
      category: 'tracking',
      isTracker: true,
    },
  };

  static identifyParameter(key: string, url: string): ParameterInfo {
    // First check if we have updated definitions from the server
    const updateService = ParameterDefinitionsUpdateService.getInstance();
    const updatedInfo = updateService.findParameterInfo(url, key);
    if (updatedInfo) {
      return updatedInfo;
    }
    
    // Fall back to built-in definitions
    const knownParam = this.parameterDefinitions[key.toLowerCase()];
    if (knownParam) {
      return knownParam;
    }

    // Try to identify based on patterns
    if (key.toLowerCase().includes('track') || key.toLowerCase().includes('click')) {
      return {
        name: this.formatParameterName(key),
        description: 'Tracking parameter',
        category: 'tracking',
        isTracker: true,
      };
    }

    if (key.toLowerCase().includes('session') || key.toLowerCase().includes('sid')) {
      return {
        name: this.formatParameterName(key),
        description: 'Session identifier',
        category: 'analytics',
        isTracker: true,
      };
    }

    if (key.toLowerCase().includes('id') && key.length < 10) {
      return {
        name: this.formatParameterName(key),
        description: 'Identifier parameter',
        category: 'technical',
        isTracker: false,
      };
    }

    // Default for unknown parameters
    return {
      name: this.formatParameterName(key),
      description: 'Unknown parameter',
      category: 'unknown',
      isTracker: false,
    };
  }

  private static formatParameterName(key: string): string {
    // Convert snake_case or kebab-case to Title Case
    return key
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  static getSiteSpecificInfo(url: string): { siteName: string; primaryTrackers: string[] } {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return {
        siteName: 'YouTube',
        primaryTrackers: ['si', 'feature'],
      };
    }

    if (hostname.includes('amazon.')) {
      return {
        siteName: 'Amazon',
        primaryTrackers: ['ref', 'psc', 'pd_rd_i', 'pd_rd_r', 'pd_rd_w', 'pd_rd_wg'],
      };
    }

    if (hostname.includes('google.')) {
      return {
        siteName: 'Google',
        primaryTrackers: ['gclid', 'utm_source', 'utm_medium', 'utm_campaign'],
      };
    }

    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      return {
        siteName: 'Facebook',
        primaryTrackers: ['fbclid', 'fb_action_ids', 'fb_source'],
      };
    }

    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return {
        siteName: 'Twitter/X',
        primaryTrackers: ['twclid'],
      };
    }

    return {
      siteName: hostname,
      primaryTrackers: [],
    };
  }
}