#!/bin/sh
lessc app/src/buttons.less poc-template/public/style.css
kss-node app/src --template poc-template -c poc-template/public/style.css