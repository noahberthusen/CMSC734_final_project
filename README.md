To run the server, open Terminal (for Mac) or Command Prompt (for Windows). Navigate to the folder `CMSC734_final_project` using for example, `cd CMSC734_final_project`.
You should now be in the directory `CMSC734_final_project`. Now we will run a python command which will create an HTTP web server for this current directory and all of its sub-directories. In the console execute the following command if you're running Python 2.x:

`python -m SimpleHTTPServer 8080`

if you're running Python 3.x or higher, use

`python -m http.server 8080`  (or `python3 -m http.server 8080`)

Now, open your browser and type http://localhost:8080/ in the URL bar and press enter or go.