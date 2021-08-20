import { GrNavigate } from "react-icons/gr";

export default {
    name: 'navigationItem',
    title: 'Navigation Item',
    type: 'object',
    icon: GrNavigate,
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Navigation Menu label'
          },
          {
            name: 'navigationItemUrl',
            type: 'reference', 
            title: 'select submenu',
            to: {type: 'navigationMenu'},
          }
    ]
}