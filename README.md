## Welcome to Dhanrakshakh

### Installation Guide
 ## Manually Inatallation Guide
  - install nodejs on your local Machine
  - install git on your local machine
  - clone this repo by this command 
   - run git clone github.com/rahul810050/dhan-rakshak
  - install all the dependencies 
   - run npm install 
  - get yourself a database on firebase and put the firebase configuration to firebase.ts
  - install python on your local machine 
  - now get yourself all the apis and .env variables from https://cloud/console.com google also provide $300 credits
  - to run the project 
   - run npm run dev
  - go to 
   - http://localhost:3000
 ## using Dockerfile
   - clone the repo and run the docker command 
   - CMD docker build -t dhanrakshak .
   - CMD docker run -p 3000:3000 dhanrakshak 

 ## Install Using Docker 
  - install docker on your local machine
  - now bring the image from https://docker.hub.com
   - run docker pull cocane/dhanrakshak
  - now to run the code
  - CMD docker run -p 3000:3000 cocane/dhanrakshak
  - go to http://localhost:3000