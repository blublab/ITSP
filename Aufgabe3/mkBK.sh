#!/bin/bash

rm -rf backup/*

scp -r root@bob.com:/etc/apache2 ./backup
scp -r root@bob.com:/root ./backup
scp -r root@bob.com:/etc/redis ./backup
