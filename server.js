const http  = require('http')
const express = require("express")
const path = require("path")
const bodyParser = require('body-parser');
const fs = require('fs');
const { table } = require('console');


let session = false;
let sessionArr = [];

const app = express()
const PORT = process.env.PORT || 3000;

let usersDb = [
    {
      id: 1,
      login: 'user1',
      passwd: 'passwd1',
      age: '12',
      isStudent: 'checked',
      plec: 'k'
    },
    {
      id: 2,
      login: 'user2',
      passwd: 'passwd2',
      age: '32',
      isStudent: '',
      plec: 'm'
    },
    {
      id: 3,
      login: 'user3',
      passwd: 'passwd3',
      age: '91',
      isStudent: '',
      plec: 'k'
    },
    {
      id: 4,
      login: 'user4',
      passwd: 'passwd4',
      age: '4',
      isStudent: 'checked',
      plec: 'm'
    }
  ];
  

app.use(express.static('static'));
app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

//   -------------------- GET REQUESTS --------------------

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/static/pages/index.html"))   
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + "/static/pages/login.html"))   
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + "/static/pages/register.html"))   
});

app.get('/admin', (req, res) => {
    if(session){
        // res.sendFile(path.join(__dirname + "/static/pages/admin.html"))
        let f = fs.readFileSync(__dirname + "/static/pages/admin.html").toString();
        f = f.replace("</ul>", `<li><a href="/logout">Logout</a></li></ul>`);
        f = f.replace("#table#", `<h1> Panel Admina </h1> <br> <h2>Hello user: ${sessionArr[0].login} !!!</h2><br> <div class="userDetails"> <p> Status: ${(sessionArr[0].isStudent)?"Student":"Not Student"} </p> 
        <p> You are ${sessionArr[0].age} years old, so you are about ${80 - parseInt(sessionArr[0].age) } years left. <p>Gender: ${ (sessionArr[0].plec == 'm')? "Male":"Female" }</p> <div>`);
        res.send(f);
    }
    else {
        res.sendFile(path.join(__dirname + "/static/pages/noright.html"))
    }
       
});

//   -------------------- POST REQUESTS -------------------



app.post('/registerHandle', (req,res)=>{
    let givenLogin = req.body.login;
    let passwd = req.body.password;
    let age = req.body.wiek;
    let isStudent = req.body.uczen;
    let gender = req.body.plec;

      // zakladamy ze uzytkownik istnieje, ale weryfikujemy to przez petle foreach
    let newUser = true;
    usersDb.forEach(({ login }) => {
        if (login == givenLogin) {
          newUser = false;
        }
    }); 

    let generatedId = usersDb[usersDb.length - 1].id + 1;

    if (newUser) {
        // przechwytujemy dane które użytkownik wprowadził w inputach
        let userObject = {
          id: generatedId,
          login: givenLogin,
          passwd: passwd,
          age: age,
          isStudent: isStudent == 'on' ? 'checked' : '',
          plec: gender
        };

        usersDb.push(userObject);
        
        let f = fs.readFileSync(__dirname + "/static/pages/alert.html").toString();

        f = f.replace("#givenLogin#", givenLogin);
        res.send(f);

    }else {
        // res.send(`<h1 class="alert"> User: ${givenLogin} already exists in data base !!! </h1> <br><a href="/register">Register</a>`)
        let f = fs.readFileSync(__dirname + "/static/pages/error.html").toString();

        f = f.replace("#givenLogin#", givenLogin);
        f = f.replace("#alert#", "This user already exists in DB !!! Try again !!!");
        res.send(f);
      }
    



});


app.post('/loginHandle',(req,res)=>{
    let login = req.body.login;
    let password = req.body.password;


    usersDb.forEach(user => {
        if (user.login == login && user.passwd == password) {
          session = true;
          sessionArr.push(user);
        }
    });

    if (session) {      
        res.redirect('/admin');
      } else {
        // res.send('niepoprawne dane');
        let f = fs.readFileSync(__dirname + "/static/pages/error.html").toString();

        f = f.replace("#givenLogin#", login);
        f = f.replace("#alert#", "Incorrect login or password");
        res.send(f);
      }

});




//   ---------------- ADMIN'S GET REQUESTS ---------------

app.get('/show', (req,res)=> {

    if(session){
        let f = fs.readFileSync(__dirname + "/static/pages/admin.html").toString();
        f = f.replace("</ul>", `<li><a href="/logout">Logout</a></li></ul>`);
        usersDb.sort((a, b) => {
            return a.id - b.id;
          });
    
        //   Generowanie tabelki
          let table = `<table class="tabelka">`;
          usersDb.forEach(user => {
            table += '<tr>';
            table += `<td>id: ${user.id} </td>`;
            table += `<td>user: ${user.login} - ${user.passwd} </td>`;
            table += `<td>uczeń: <input type="checkbox" ${
              user.isStudent
            } disabled> </td>`;
            table += `<td>wiek: ${user.age}</td>`;
            table += `<td>płeć: ${user.plec}</td>`;
            table += '</tr>';
          });
          table += `</table>`;
    
        f = f.replace("#table#", table);
        res.send(f);
    } else {
        res.sendFile(path.join(__dirname + "/static/pages/noright.html")) 
    }
});

app.get('/gender', (req,res)=> {

    if(session){

        let f = fs.readFileSync(__dirname + "/static/pages/admin.html").toString();
        f = f.replace("</ul>", `<li><a href="/logout">Logout</a></li></ul>`);
        let women = `<table class="tabelka">`
        let man = `<table class="tabelka">`
    
        usersDb.forEach(user => {
            if (user.plec == 'k') {
              women += `<tr><td>id: ${user.id}</td><td>płeć: ${
                user.plec
              }</td></tr>`;
            } else {
              man += `<tr> <td>id: ${user.id}</td><td>płeć: ${user.plec}</td> </tr>`;
            }
          });
          women += `</table>`;
          man += `</table>`;
    
          let tables = man + "<br/><hr/><br/>" + women;
    
          f = f.replace("#table#", tables);
          res.send(f);

    } else {
        res.sendFile(path.join(__dirname + "/static/pages/noright.html")) 
    }


});

app.get('/sort', (req,res)=> {
    if(session){
        let f = fs.readFileSync(__dirname + "/static/pages/admin.html").toString();
        f = f.replace("</ul>", `<li><a href="/logout">Logout</a></li></ul>`);
        let sort = req.query.sortBy;
        let form = `
        <form onchange="this.submit()" method="GET" action="/sort">
            <input name="sortBy" type="radio" value="asc" ${ sort == 'asc' ? 'checked' : '' }> rosnąco
            <input name="sortBy" type="radio" value="desc" ${ sort == 'desc' ? 'checked' : ''}> malejąco 
        </form>
        `;
        let table = `<table class="tabelka">`;
        let ageSorted = usersDb.sort((a, b) => {
            if (sort == 'asc') {
              return parseFloat(a.age) - parseFloat(b.age);
            } else if (sort == 'desc') {
              return parseFloat(b.age) - parseFloat(a.age);
            } else {
              return 0;
            }
        });

        ageSorted.forEach(({ id, login, passwd, age }) => {
            table += `<tr> <td>id: ${id}</td><td>user: ${login} - ${passwd}</td><td> wiek: ${age}</td> </tr>`;
        });

        table += `</table>`
        let html = `<div class="form_i_tabelka">` + form + table + `</div>`;
        f = f.replace("#table#", html);
        res.send(f);


    } else {
        res.sendFile(path.join(__dirname + "/static/pages/noright.html")) 
    }
});

app.get('/logout',(req,res)=>{
  session = false;
  sessionArr = [];
  res.redirect('/admin');
})

app.listen(PORT, function() {
    console.log('start serwera na porcie ' + PORT);
});