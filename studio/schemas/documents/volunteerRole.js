import React from 'react'
import AutoSlugInput from '../../src/components/AutoSlugInput'

export default {
    name: 'volunteerRole',
    type: 'document',
    title: 'Volunteer Role',
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Role name',
        validation: Rule => Rule.required()
      },
      {
        name: 'slug',
        type: 'slug',
        title: 'Slug',
        description: 'The unique address that the role will live at. (e.g. "/volunteer/your-role")',
        components: {
          input: AutoSlugInput
        },
        options: {
          maxLength: 96,
          source: 'title',
          slugify: (input) => {
            const base = String(input || '')
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^\w\-]+/g, '')
              .replace(/\-\-+/g, '-');
            const trimmed = base.replace(/^\/+/, '').replace(/^volunteer\//, '');
            if (!trimmed) return '';
            return `/volunteer/${trimmed}`;
          },
        },
        validation: Rule => Rule.error('Add a slug to publish this role.').required()
      },
      {
        title: 'Active role',
        name: 'active',
        type: 'boolean',
        initialValue: true
      },
      {
        name: 'motorsportRegEvent',
        type: 'motorsportRegEvent',
        title: 'All MSR active Events:',
        description: 'Select a MotorsportReg event for this role.',
        validation: Rule => Rule.error('Select a MotorsportReg event.').required(),
      },
      {
        name: 'category',
        type: 'reference',
        to: {
          type: 'volunteerCategory',
        },
        title: 'Category',
        validation: Rule => Rule.error('Select a category.').required(),
      },
      {
        name: 'descriptionPdf',
        type: 'file',
        title: 'Description PDF (optional)',
        options: {
          accept: '.pdf',
        },
      },
      {
        name: 'workDescription',
        type: 'text',
        title: 'Description of work',
        rows: 4,
        validation: Rule => Rule.required().error('Provide a description of work.')
      },
      {
        name: 'date',
        type: 'date',
        title: 'Date',
        validation: Rule => Rule.required().error('Provide a date.')
      },
      {
        name: 'duration',
        type: 'number',
        title: 'Duration',
        description: 'Hours (numbers only)',
        validation: Rule =>
          Rule.required()
            .min(0)
            .error('Provide a duration in hours (numbers only).')
      },
      {
        name: 'compensation',
        type: 'string',
        title: 'Compensation / swag item',
        validation: Rule => Rule.optional()
      },
      {
        name: 'volunteerPoints',
        type: 'number',
        title: 'Volunteer program points',
        options: {
          list: [
            { title: '1', value: 1 },
            { title: '2', value: 2 },
            { title: '3', value: 3 },
            { title: '4', value: 4 },
            { title: '5', value: 5 }
          ]
        },
        validation: Rule =>
          Rule.custom((field) =>
            field === undefined || field === null ? 'Select a point allotment.' : true
          )
      },
      {
        name: 'skillLevel',
        type: 'string',
        title: 'Skill level',
        options: {
          list: [
            { title: 'Entry', value: 'entry' },
            { title: 'Medium', value: 'medium' },
            { title: 'High', value: 'high' }
          ]
        },
        validation: Rule => Rule.required().error('Select a skill level.')
      },
      {
        name: 'membershipRequired',
        type: 'boolean',
        title: 'BMW CCA Membership Required',
        initialValue: false,
        validation: Rule =>
          Rule.required().custom((value) =>
            value === true || value === false ? true : 'Select Yes or No.'
          )
      }
    ],
    preview: {
      select: {
        title: 'title',
        subtitle: 'motorsportRegEvent.name',
        imageUrl: 'motorsportRegEvent.imageUrl'
      },
      prepare({ title, subtitle, imageUrl }) {
        const normalizedUrl =
          imageUrl && imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl
        return {
          title,
          subtitle,
          media: normalizedUrl
            ? React.createElement('img', {
                src: normalizedUrl,
                alt: title || subtitle || 'Volunteer role',
                style: { objectFit: 'cover', width: '100%', height: '100%' }
              })
            : undefined
        }
      }
    }
  }
