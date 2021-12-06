export default {
    name: 'advertiser',
    type: 'document',
    title: 'Advertiser',
    fieldsets: [
        {
            title: 'Assets',
            name: 'assets'
        }
    ],
    fields: [
      // basic fields for all advertisers
      {
        name: 'name',
        type: 'string',
        title: 'Name'
      },
      {
        title: 'Active',
        name: 'active',
        type: 'boolean',
        initialValue: true
      },
      {
        name: 'description',
        type: 'simpleBlockContent',
        title: 'Description'
      },
      {
        name: 'category',
        type: 'reference',
        to: {
            type: 'advertiserCategory',
        },
        title: 'Category',
        validation: Rule => Rule.error('You have to select a category.').required(),
        options: {
            isHighlighted: true
        },
      },
      {
        name: 'tier',
        type: 'reference',
        to: {
            type: 'tier',
        },
        title: 'Tier',
        validation: Rule => Rule.error('You have to select a tier.').required(),
        options: {
            isHighlighted: true
        },
      },
      {
        name: 'logo',
        type: 'image',
        title: 'Logo',
        validation: Rule => Rule.error('You must provide a logo for the advertiser.').required(),
        description: "The logo of the advertiser",
        fieldset: 'assets'
      },
      {
        name: 'banner',
        type: 'image',
        title: 'Banner Ad',
        description: "Should not exceed 728x90 pixels",
        fieldset: 'assets'
      },
      {
        name: 'box',
        type: 'image',
        title: 'Box Ad',
        description: "Should not exceed 300x250 pixels",
        fieldset: 'assets'
      },
      {
        name: 'slide',
        type: 'image',
        title: 'Slide Ad',
        fieldset: 'assets'
      },
    ],
    preview: {
      select: {
        title: 'name',
        media: 'logo'
      }
    }
  }