const app = require("./app"); //importing the App logic
const http = require("http"); //http package

const port = process.env.PORT || "3000"; //setting the port

const server = http.createServer(app); //Creating a server and setting it to App Logic

server.listen(port, () => {    //Server listening on the specified port
    console.log('Server listening on port 3000');
});
