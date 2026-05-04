#Install json-server (sekali saja)
npm install -g json-server

#Menjalankan JSON Server.
#Jalankan di folder db.json
json-server --watch db.json --port 3000

#Menjalankan Server (Normal/Production).
#Jalankan di folder root
npm run start

#Menjalankan Server (Development).
#Jalankan di folder root
npm run dev

#Create a new repository on the command line
echo "# cbt-simple" >> README.md
git init
git add README.md
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/ariblack/cbt-simple.git
git push -u origin main