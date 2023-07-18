module.exports = {

   'url': {
        user: 'tgadmin',
        password: 'To0lagen',
        server: 'tgsqlserver.database.windows.net', // You can use 'localhost\\instance' to connect to named instance 
        database: 'TG-Database',
        port:1433,

        options: {
            encrypt: true // Use this if you're on Windows Azure 
        }
    }
}
