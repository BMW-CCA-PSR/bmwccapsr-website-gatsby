import React from 'react'
import AutoSlugInput from '../../src/components/AutoSlugInput'

export default {
    name: 'volunteerRole',
    type: 'document',
    title: 'Volunteer Position',
    fieldsets: [
      {
        name: 'positionToggles',
        title: 'Position settings'
      }
    ],
    fields: [
      {
        name: 'role',
        type: 'reference',
        to: {
          type: 'volunteerFixedRole',
        },
        title: 'Role',
        validation: Rule => Rule.error('Select a role.').required(),
      },
      {
        name: 'slug',
        type: 'slug',
        title: 'Slug',
        description: 'Auto-generated from role name + event + date. (e.g. "/volunteer/grid-marshall-pacific-raceways-2026-04-18")',
        components: {
          input: AutoSlugInput
        },
        options: {
          maxLength: 96,
          source: 'role',
        },
        validation: Rule => Rule.error('Add a slug to publish this position.').required()
      },
      {
        title: 'Active position',
        name: 'active',
        type: 'boolean',
        initialValue: true,
        fieldset: 'positionToggles'
      },
      {
        name: 'membershipRequired',
        type: 'boolean',
        title: 'BMW CCA Membership Required',
        initialValue: false,
        fieldset: 'positionToggles',
        validation: Rule =>
          Rule.required().custom((value) =>
            value === true || value === false ? true : 'Select Yes or No.'
          )
      },
      {
        name: 'motorsportRegEvent',
        type: 'motorsportRegEvent',
        title: 'Event',
        description: 'Select a MotorsportReg event for this position.',
        validation: Rule => Rule.error('Select a MotorsportReg event.').required(),
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
        name: 'skillLevel',
        type: 'string',
        title: 'Skill level',
        options: {
          list: [
            { title: 'Entry', value: 'entry' },
            { title: 'Intermediate', value: 'medium' },
            { title: 'Advanced', value: 'high' }
          ]
        },
        validation: Rule => Rule.required().error('Select a skill level.')
      }
    ],
    preview: {
      select: {
        roleName: 'role.name',
        eventName: 'motorsportRegEvent.name',
        date: 'date',
        points: 'role.pointValue',
        imageUrl: 'motorsportRegEvent.imageUrl'
      },
      prepare({ roleName, eventName, date, points, imageUrl }) {
        const title = roleName || 'Untitled position'
        const subtitleParts = [eventName]
        if (date) subtitleParts.push(date)
        if (points !== undefined && points !== null) {
          subtitleParts.push(`${points} pts`)
        }
        const subtitle = subtitleParts.filter(Boolean).join(' | ')
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
