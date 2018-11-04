const bcrypt = require('bcrypt');

bcrypt.hash("AKISTHEBEST", 15, (err, encrypt) => {
    if (!err)
        console.log(encrypt);
})