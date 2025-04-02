import { createThirdwebClient } from 'thirdweb'

export const client = createThirdwebClient({
    clientId: '383098607d3761870cc77edaab59865e',
    secretKey: 'IPjRZS608N7YfLqkzH86f47Dj5PF_GeGNOEfuCv_AdonYpjnAlDK87Ju8MUFALZ1rrVEHnwaDBB_I9J8KGKkeg'
    // clientId: process.env.THIRDWEB_CLIENT_ID,
    // secretKey: process.env.THIRDWEB_SECRET_KEY || ''
})
