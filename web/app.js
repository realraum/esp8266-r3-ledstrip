const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mdns = require('multicast-dns')();

const indexRouter = require('./routes/index');

const app = express();

let devices = [];

/*
Service Type: _partylightws._tcp
Service Name: party-lights-13a59a
Domain Name: local
Interface: wlan0 IPv4
Address: party-lights-13a59a.local/192.168.69.153:80
TXT version = efc402b-dirty
TXT git_branch = main
TXT git_commit = efc402b95374d47d84c5eb3fba37e753538cb0d7
 */

const service_type = '_partylightws._tcp.local';

// log ip address
const mdns_func = () => {
    mdns.query({
        questions: [{
            name: service_type,
            type: 'PTR'
        }]
    });

    devices = devices.filter((device) => {
        return !!(device && device.ip);
    });
};
mdns_func();
setInterval(mdns_func, 30000);

mdns.on('response', (response) => {
    response.answers.forEach((answer) => {
        if (answer.type === 'PTR') {
            if (answer.name !== service_type) return;

            mdns.query({
                questions: [{
                    name: answer.data,
                    type: 'SRV',
                    id: 42,
                }],
            });
        } else if (answer.type === 'SRV') {
            if (!answer.name.endsWith(service_type)) return;

            mdns.query({
                questions: [{
                    name: answer.data.target,
                    type: 'A'
                }],
            });
        } else if (answer.type === 'A') {
            console.log('A', answer, response);

            if (!answer.name.includes('party-lights')) return; // stupid hack because mdns gives me responses for other services

            const index = devices.findIndex((device) => device && device.name === answer.name);
            if (index === -1) {
                devices.push({
                    name: answer.name,
                    ip: answer.data,
                });
            } else {
                devices[index].ip = answer.data;
            }

            setTimeout(() => {
                delete devices[index];
            }, answer.ttl * 1000);
        }
    });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));

app.get('/devices', (req, res) => {
    res.json(devices);
});

app.use('/', indexRouter);

module.exports = app;
