#!/bin/bash

REL_PATH="`dirname \"$0\"`"

$REL_PATH/apacheCA/sslCA/rootCA/gen_rootCA.sh
$REL_PATH/apacheCA/sslCA/gen_sslCA.sh
$REL_PATH/apacheCA/gen_apacheCA.sh

cat $REL_PATH/apacheCA/sslCA/sslCA.crt >> $REL_PATH/final.crt

cat $REL_PATH/apacheCA/sslCA/rootCA/certs/rootCA.crt >> $REL_PATH/final.crt



scp $REL_PATH/final.crt root@example.com:/certs
scp $REL_PATH/apacheCA/diana-yavuz.informatik.haw-hamburg.de.key root@example.com:/certs
scp $REL_PATH/apacheCA/diana-yavuz.informatik.haw-hamburg.de.crt root@example.com:/certs
