module.exports = {
    'clientID': '5a9fe6d8-7b17-435d-a5fd-9383a43d82d9',
    'clientSecret': 'EcQ8Q~xfSRCPlkcc55RMh8szgC8Sig_gcLdeYcW9',
    //'returnURL' :'https://tg-service-timesheet.azurewebsites.net/auth/openid/return',
    'returnURL': 'https://localhost:3000/auth/openid/return',
    // 'realm': '',
    // 'issuer': '',
    'identityMetadata': 'https://login.microsoftonline.com/common/.well-known/openid-configuration',
    'skipUserProfile': true,
    'responseType': 'id_token code',
    'responseMode': 'query'
}