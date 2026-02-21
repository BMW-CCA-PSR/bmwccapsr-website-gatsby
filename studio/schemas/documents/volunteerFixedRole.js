import { RiUserStarLine as VolunteerRoleIcon } from 'react-icons/ri'

export default {
  name: 'volunteerFixedRole',
  type: 'document',
  title: 'Volunteer Role',
  icon: VolunteerRoleIcon,
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: Rule => Rule.required().error('Add a role name.')
    },
    {
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 3,
      validation: Rule => Rule.required().error('Add a short role description.')
    },
    {
      name: 'detail',
      type: 'text',
      title: 'Detail',
      rows: 5
    },
    {
      name: 'pointValue',
      type: 'number',
      title: 'Point value',
      options: {
        list: [
          { title: '1', value: 1 },
          { title: '2', value: 2 },
          { title: '3', value: 3 },
          { title: '4', value: 4 },
          { title: '5', value: 5 },
          { title: '10', value: 10 }
        ]
      },
      validation: Rule => Rule.required().error('Select a point value.')
    }
  ],
  preview: {
    select: {
      title: 'name',
      points: 'pointValue'
    },
    prepare({ title, points }) {
      const pointLabel =
        points === undefined || points === null
          ? 'No point value set'
          : `${points} point${points === 1 ? '' : 's'}`
      return {
        title: title || 'Untitled role',
        subtitle: pointLabel
      }
    }
  }
}
