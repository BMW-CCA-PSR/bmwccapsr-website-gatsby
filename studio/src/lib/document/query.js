import {useClient} from 'sanity'
import {defer} from 'rxjs'

const client = useClient({apiVersion: `2021-05-19`})

export function getDocumentQuery$(query, params = {}) {
  return defer(() => client.observable.fetch(query, params))
}