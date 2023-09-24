# rinha-js


## How to run:
Docker Build:
```
docker build -t rinha:rinha-js .
```
Docker Run:
```
docker run -v ./source.rinha.json:/var/rinha/source.rinha.json --memory=2gb --cpus=2 rinha:rinha-js