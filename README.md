# API Surrogate search
API Surrogate searh allows you to search for API's(Active Pharmaceutical Ingredients) with SMILES string or compound Names and gives relevent drugs with Formulation details


## getting started
clone this repository
```sh
    git clone git@github.com:aganitha/formulations.git
```

cd to formulations directory and install all the dependencies

```sh
    cd formulation
    npm install
```
generate prisma client
```sh
    npx prisma migrate dev --name init 
```
create db by importing data from csv files

for the main data base we are using sqlite. to load the to the db you need two csv files

 - dailymed.csv
 - pubchem.csv

 you can find these two files in this [google-drive](https://drive.google.com/drive/folders/12NL3vAp2fFWFn3xLDBad0JhkFNqdCcSd)

 ones you have this files create a folder called ```data``` in the projects root directory and place these file there.

 then run
```sh
    npm run importcsv
    #takes around 8 minutes of time
```
## start server
to start a dev server run
```sh
    npm run dev
```

to start a prod server
```sh
    npm rub build
    npm start
```

## getting started with docker
when you clone the repo you will fond one docker file to start a prod container 

build the image
```sh
    docker build -t surrogate-api .
```
spin the container
```sh
    docker run -d  --label port=3007 --name=surrogate-api surrogate-api
```
