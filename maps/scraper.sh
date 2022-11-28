#!/bin/bash

cd "wayback_data"
for i in {24..56}
do
    mkdir state_$i
    cd state_$i

    mkdir counties
    mkdir metros
    if (($i < 10))
    then
        cd counties
        wayback-machine-scraper livingwage.mit.edu/states/0$i/locations -a 'counties' -f 20120101 -t 20221012
        cd ../metros
        wayback-machine-scraper livingwage.mit.edu/states/0$i/locations -a 'metros' -f 20120101 -t 20221012
        cd ..
    else
        cd counties
        wayback-machine-scraper livingwage.mit.edu/states/$i/locations -a 'counties' -f 20120101 -t 20221012
        cd ../metros
        wayback-machine-scraper livingwage.mit.edu/states/$i/locations -a 'metros' -f 20120101 -t 20221012
        cd ..
    fi
    cd ..
done