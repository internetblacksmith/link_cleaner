# Link Cleaner Parameter Definitions

This repository hosts the parameter definitions for the Link Cleaner app. The app automatically fetches updates from this repository to identify new tracking parameters.

## How to Set Up Your Own Repository

1. **Fork or create a new repository** named `link-cleaner-definitions`

2. **Copy the `parameter-definitions.json` file** to your repository

3. **Update the app configuration** in `ParameterDefinitionsUpdateService.ts`:
   ```typescript
   const GITHUB_USER = 'yourusername';  // Replace with your GitHub username
   const GITHUB_REPO = 'link-cleaner-definitions';
   ```

4. **Commit and push** the file to your repository

## How Updates Work

- The app checks for updates every 24 hours
- Updates are fetched via JSDelivr CDN for better performance
- Falls back to GitHub raw URLs if CDN fails
- Users can manually check for updates in Settings

## Adding New Parameter Definitions

To add new tracking parameters:

1. Edit `parameter-definitions.json`
2. Increment the `version` number
3. Update the `lastUpdated` date
4. Add your parameter definitions in the appropriate section

### Example Structure

```json
{
  "version": "1.0.1",
  "lastUpdated": "2024-01-30",
  "definitions": {
    "youtube": {
      "domain": ["youtube.com", "youtu.be"],
      "parameters": {
        "new_param": {
          "name": "Human Readable Name",
          "description": "What this parameter tracks",
          "category": "tracking",
          "isTracker": true
        }
      }
    },
    "global": {
      "parameters": {
        "universal_param": {
          "name": "Universal Parameter",
          "description": "Works on all sites",
          "category": "analytics",
          "isTracker": true
        }
      }
    }
  }
}
```

## Categories

- `tracking` - General tracking parameters
- `campaign` - Marketing campaign tracking
- `analytics` - Analytics and measurement
- `social` - Social media tracking
- `technical` - Technical parameters (timestamps, IDs)
- `unknown` - Unknown purpose

## Contributing

Feel free to submit pull requests with new parameter definitions! Please ensure:
- Parameters are properly categorized
- Descriptions are clear and concise
- The JSON file remains valid
- Version number is incremented

## Privacy

This repository only contains parameter definitions. No user data is ever sent or stored.