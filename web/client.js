import sanityClient from '@sanity/client';
import clientConfig from "./client-config";


export default sanityClient({
    ...clientConfig.sanity
});