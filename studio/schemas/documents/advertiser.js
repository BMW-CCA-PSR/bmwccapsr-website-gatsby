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
        title: 'Name',
        validation: Rule => Rule.max(32).error(`A advertiser name cannot exceed 32 characters.`).required()
      },
      {
        title: 'Active Advertiser',
        name: 'active',
        type: 'boolean',
        initialValue: true
      },
      {
        title: 'Active Partner',
        name: 'partner',
        type: 'boolean',
        initialValue: false
      },
      {
        name: 'description',
        type: 'simpleBlockContent',
        title: 'Description'
      },
      {
        name: 'discount',
        type: 'string',
        title: 'Discount',
        hidden: ({document}) => !document?.partner,
        validation: Rule => Rule.max(32).error(`A discount cannot exceed 32 characters.`).required()
      },
      {
        title: 'External link',
        description: 'Example: https://www.bmwseattle.com/',
        name: 'href',
        validation: Rule => Rule.error('You have to provide an advertiser web address.').required(),
        type: 'url'
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
        validation: Rule => Rule.custom((field, context) => (context.document.active && field === undefined) ? "You have to select a tier." : true),
        //validation: Rule => Rule.error('You have to select a tier.').required(),
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
        name: 'slideAd',
        title: 'Slide Ad',
        type: 'hero',
        description: "For Plat/Gold tier only",
        fieldset: 'assets'
      },
    ],
    preview: {
      select: {
        title: 'name',
        media: 'logo',
        subtitle: 'tier.title'
      }
    }
  }