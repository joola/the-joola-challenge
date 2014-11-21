## Selected Stack

* Language: Node.JS
* Web Server: Express 4.0
* Database: InfluxDB
* JavaScript Framework: Angular.JS + N3-Charts for graphing
* WebSockets Library: Primus/Engine.IO

## Demo

Demo is live here: http://54.67.67.171:4000/

## Local development

* `git clone https://github.com/shaharke/the-joola-challenge.git -b challenge-accepted`
* `cd the-joola-challenge && cd vagrant && vagrant up`: setups InfluxDB instance (admin console at http://localhost:8083)
* `cd .. && npm install && bower install`: installs server-side and client side dependencies
* `npm start`: runs the server in the foreground on port 4000
